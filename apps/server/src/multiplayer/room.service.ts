import { Injectable } from '@nestjs/common';
import { randomInt, randomUUID } from 'crypto';
import type {
  GameRoom,
  MultiplayerMode,
  RoomPlayer,
  RoomResult,
  RoomStatus,
} from '@three-towers/shared';
import type { GameState } from '@three-towers/shared';
import { SeededRandom } from '@three-towers/game-engine';

export interface RoomMember {
  userId: string;
  username: string;
  socketId: string;
  ready: boolean;
  state: GameState | null;
}

export interface InternalRoom {
  id: string;
  code: string;
  hostId: string;
  mode: MultiplayerMode;
  status: RoomStatus;
  seed: number | null;
  maxPlayers: number;
  players: Map<string, RoomMember>;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_PLAYERS = 4;

@Injectable()
export class RoomService {
  private readonly rooms = new Map<string, InternalRoom>();
  private readonly codeIndex = new Map<string, string>();

  createRoom(hostId: string, username: string, socketId: string, mode: MultiplayerMode): InternalRoom {
    const id = randomUUID();
    const code = this.generateCode();

    const room: InternalRoom = {
      id,
      code,
      hostId,
      mode,
      status: 'waiting',
      seed: null,
      maxPlayers: MAX_PLAYERS,
      players: new Map([
        [
          hostId,
          { userId: hostId, username, socketId, ready: false, state: null },
        ],
      ]),
      createdAt: new Date(),
      startedAt: null,
      finishedAt: null,
    };

    this.rooms.set(id, room);
    this.codeIndex.set(code, id);
    return room;
  }

  joinRoom(code: string, userId: string, username: string, socketId: string): InternalRoom {
    const room = this.getRoomByCode(code);

    if (room.status !== 'waiting') {
      throw new Error('Game already in progress');
    }

    const existing = room.players.get(userId);
    if (existing) {
      existing.socketId = socketId;
      return room;
    }

    if (room.players.size >= room.maxPlayers) {
      throw new Error('Room is full');
    }

    room.players.set(userId, {
      userId,
      username,
      socketId,
      ready: false,
      state: null,
    });

    return room;
  }

  leaveRoom(userId: string): InternalRoom | null {
    const room = this.getRoomByUserId(userId);
    if (!room) return null;

    const member = room.players.get(userId);

    if (room.status === 'playing' && member?.state?.status === 'playing') {
      member.state = { ...member.state, status: 'lost' };
      this.tryFinishRoom(room);
    }

    room.players.delete(userId);

    if (room.players.size === 0) {
      this.deleteRoom(room);
      return null;
    }

    if (room.hostId === userId) {
      const nextHost = room.players.values().next().value;
      if (nextHost) room.hostId = nextHost.userId;
    }

    return room;
  }

  setReady(userId: string, ready: boolean): InternalRoom {
    const room = this.getRoomByUserId(userId);
    if (!room) throw new Error('Not in a room');
    if (room.status !== 'waiting') throw new Error('Game already started');

    const member = room.players.get(userId);
    if (!member) throw new Error('Not in a room');

    member.ready = ready;
    return room;
  }

  startGame(hostId: string, seed?: number): InternalRoom {
    const room = this.getRoomByUserId(hostId);
    if (!room) throw new Error('Not in a room');
    if (room.hostId !== hostId) throw new Error('Only the host can start');
    if (room.status !== 'waiting') throw new Error('Game already started');
    if (room.players.size < 2) throw new Error('Need at least 2 players');

    const allReady = [...room.players.values()].every((p) => p.ready);
    if (!allReady) throw new Error('All players must be ready');

    const actualSeed =
      seed ??
      new SeededRandom((Date.now() >>> 0) ^ randomInt(1, 2_147_483_647)).nextInt(
        1,
        2_147_483_647,
      );

    room.seed = actualSeed;
    room.status = 'playing';
    room.startedAt = new Date();

    return room;
  }

  getRoomByUserId(userId: string): InternalRoom | null {
    for (const room of this.rooms.values()) {
      if (room.players.has(userId)) return room;
    }
    return null;
  }

  getRoomByCode(code: string): InternalRoom {
    const id = this.codeIndex.get(code.toUpperCase());
    if (!id) throw new Error('Room not found');

    const room = this.rooms.get(id);
    if (!room) throw new Error('Room not found');

    return room;
  }

  getRoomById(id: string): InternalRoom | null {
    return this.rooms.get(id) ?? null;
  }

  updatePlayerState(userId: string, state: GameState): InternalRoom {
    const room = this.getRoomByUserId(userId);
    if (!room) throw new Error('Not in a room');

    const member = room.players.get(userId);
    if (!member) throw new Error('Not in a room');

    member.state = state;
    return room;
  }

  tryFinishRoom(room: InternalRoom): RoomResult | null {
    const players = [...room.players.values()];
    const allDone = players.every(
      (p) => p.state && (p.state.status === 'won' || p.state.status === 'lost'),
    );

    if (!allDone) return null;

    room.status = 'finished';
    room.finishedAt = new Date();

    const rankings = players
      .map((p) => ({
        userId: p.userId,
        username: p.username,
        score: p.state?.score ?? 0,
        elapsedMs: p.state?.elapsedMs ?? 0,
        status: p.state?.status ?? 'lost',
        won: p.state?.status === 'won',
      }))
      .sort((a, b) => {
        if (a.won !== b.won) return a.won ? -1 : 1;
        if (b.score !== a.score) return b.score - a.score;
        return a.elapsedMs - b.elapsedMs;
      })
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.username,
        score: entry.score,
        elapsedMs: entry.elapsedMs,
        status: entry.status,
      }));

    return { roomId: room.id, rankings };
  }

  serializeRoom(room: InternalRoom): GameRoom {
    const players: RoomPlayer[] = [...room.players.values()].map((p) => ({
      userId: p.userId,
      username: p.username,
      ready: p.ready,
      score: p.state?.score ?? 0,
      status: p.state?.status ?? 'idle',
      elapsedMs: p.state?.elapsedMs ?? 0,
      combo: p.state?.combo ?? 0,
      finishedAt:
        p.state && p.state.status !== 'playing' ? new Date().toISOString() : undefined,
    }));

    return {
      id: room.id,
      code: room.code,
      hostId: room.hostId,
      mode: room.mode,
      status: room.status,
      seed: room.seed ?? undefined,
      maxPlayers: room.maxPlayers,
      players,
      createdAt: room.createdAt.toISOString(),
      startedAt: room.startedAt?.toISOString(),
      finishedAt: room.finishedAt?.toISOString(),
    };
  }

  private generateCode(): string {
    let code: string;
    do {
      code = Array.from({ length: 6 }, () =>
        CODE_CHARS[randomInt(0, CODE_CHARS.length)],
      ).join('');
    } while (this.codeIndex.has(code));
    return code;
  }

  private deleteRoom(room: InternalRoom): void {
    this.rooms.delete(room.id);
    this.codeIndex.delete(room.code);
  }
}
