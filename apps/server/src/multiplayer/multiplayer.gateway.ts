import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import {
  MULTIPLAYER_EVENTS,
  type CreateRoomRequest,
  type GameStartedPayload,
  type JoinRoomRequest,
  type MultiplayerMoveRequest,
  type PlayerUpdatePayload,
  type SetReadyRequest,
} from '@three-towers/shared';
import type { JwtPayload } from '../auth/auth.types';
import { UsersService } from '../users/users.service';
import { PlayerSessionService } from './player-session.service';
import { RoomService } from './room.service';

interface SocketData {
  userId: string;
  email: string;
}

@WebSocketGateway({
  namespace: '/multiplayer',
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class MultiplayerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly roomService: RoomService,
    private readonly sessionService: PlayerSessionService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) {
        client.emit(MULTIPLAYER_EVENTS.ERROR, { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      if (payload.type !== 'access') {
        client.emit(MULTIPLAYER_EVENTS.ERROR, { message: 'Invalid token type' });
        client.disconnect();
        return;
      }

      (client.data as SocketData).userId = payload.sub;
      (client.data as SocketData).email = payload.email;
    } catch {
      client.emit(MULTIPLAYER_EVENTS.ERROR, { message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const { userId } = client.data as SocketData;
    if (!userId) return;

    const room = this.roomService.leaveRoom(userId);
    if (room) {
      this.server.to(room.id).emit(
        MULTIPLAYER_EVENTS.ROOM_UPDATED,
        this.roomService.serializeRoom(room),
      );
    }
  }

  @SubscribeMessage(MULTIPLAYER_EVENTS.CREATE_ROOM)
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: CreateRoomRequest,
  ) {
    const { userId } = client.data as SocketData;
    const user = await this.usersService.findById(userId);
    if (!user) return { error: 'User not found' };

    const room = this.roomService.createRoom(
      userId,
      user.username,
      client.id,
      body.mode ?? 'casual',
    );

    await client.join(room.id);
    const serialized = this.roomService.serializeRoom(room);
    return { room: serialized };
  }

  @SubscribeMessage(MULTIPLAYER_EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinRoomRequest,
  ) {
    const { userId } = client.data as SocketData;
    const user = await this.usersService.findById(userId);
    if (!user) return { error: 'User not found' };

    try {
      const room = this.roomService.joinRoom(
        body.code,
        userId,
        user.username,
        client.id,
      );

      await client.join(room.id);
      const serialized = this.roomService.serializeRoom(room);
      this.server.to(room.id).emit(MULTIPLAYER_EVENTS.ROOM_UPDATED, serialized);
      return { room: serialized };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to join room' };
    }
  }

  @SubscribeMessage(MULTIPLAYER_EVENTS.LEAVE_ROOM)
  async handleLeaveRoom(@ConnectedSocket() client: Socket) {
    const { userId } = client.data as SocketData;
    const room = this.roomService.leaveRoom(userId);

    if (room) {
      await client.leave(room.id);
      this.server.to(room.id).emit(
        MULTIPLAYER_EVENTS.ROOM_UPDATED,
        this.roomService.serializeRoom(room),
      );
    }

    return { ok: true };
  }

  @SubscribeMessage(MULTIPLAYER_EVENTS.SET_READY)
  handleSetReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SetReadyRequest,
  ) {
    const { userId } = client.data as SocketData;

    try {
      const room = this.roomService.setReady(userId, body.ready);
      const serialized = this.roomService.serializeRoom(room);
      this.server.to(room.id).emit(MULTIPLAYER_EVENTS.ROOM_UPDATED, serialized);
      return { room: serialized };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to set ready' };
    }
  }

  @SubscribeMessage(MULTIPLAYER_EVENTS.START_GAME)
  handleStartGame(@ConnectedSocket() client: Socket) {
    const { userId } = client.data as SocketData;

    try {
      const room = this.roomService.startGame(userId);
      const serialized = this.roomService.serializeRoom(room);

      for (const [playerId] of room.players) {
        const state = this.sessionService.initPlayer(room, playerId);
        this.roomService.updatePlayerState(playerId, state);

        const playerSocketId = room.players.get(playerId)?.socketId;
        if (!playerSocketId) continue;

        const payload: GameStartedPayload = {
          room: this.roomService.serializeRoom(room),
          seed: room.seed!,
          yourState: state,
        };

        this.server.to(playerSocketId).emit(MULTIPLAYER_EVENTS.GAME_STARTED, payload);
      }

      this.server.to(room.id).emit(MULTIPLAYER_EVENTS.ROOM_UPDATED, serialized);
      return { room: serialized };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to start game' };
    }
  }

  @SubscribeMessage(MULTIPLAYER_EVENTS.SUBMIT_MOVE)
  handleSubmitMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: MultiplayerMoveRequest,
  ) {
    const { userId } = client.data as SocketData;
    const room = this.roomService.getRoomByUserId(userId);

    if (!room || room.status !== 'playing') {
      return { accepted: false, error: 'Game not in progress' };
    }

    const move =
      body.move.type === 'play'
        ? {
            type: 'play' as const,
            cardId: body.move.cardId,
            timestamp: body.move.timestamp,
          }
        : { type: 'draw' as const, timestamp: body.move.timestamp };

    const result = this.sessionService.applyMove(room, userId, move, body.elapsedMs);

    if (result.accepted && result.state) {
      this.roomService.updatePlayerState(userId, result.state);

      const update: PlayerUpdatePayload = {
        userId,
        state: result.state,
        scoreDelta: result.scoreDelta,
      };

      this.server.to(room.id).emit(MULTIPLAYER_EVENTS.PLAYER_UPDATED, update);

      const finishResult = this.roomService.tryFinishRoom(room);
      if (finishResult) {
        this.sessionService.clearRoom(room.id);
        this.server.to(room.id).emit(MULTIPLAYER_EVENTS.GAME_FINISHED, finishResult);
        this.server.to(room.id).emit(
          MULTIPLAYER_EVENTS.ROOM_UPDATED,
          this.roomService.serializeRoom(room),
        );
      }
    }

    return result;
  }

  @SubscribeMessage(MULTIPLAYER_EVENTS.SYNC_ELAPSED)
  handleSyncElapsed(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { elapsedMs: number },
  ) {
    const { userId } = client.data as SocketData;
    const room = this.roomService.getRoomByUserId(userId);
    if (!room || room.status !== 'playing') return { ok: false };

    const state = this.sessionService.syncElapsed(room.id, userId, body.elapsedMs);
    if (!state) return { ok: false };

    this.roomService.updatePlayerState(userId, state);

    const update: PlayerUpdatePayload = { userId, state };
    this.server.to(room.id).emit(MULTIPLAYER_EVENTS.PLAYER_UPDATED, update);

    return { ok: true };
  }
}
