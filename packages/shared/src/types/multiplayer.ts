import type { GameState, GameStatus } from './game';

export type MultiplayerMode = 'ranked' | 'casual';
export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface RoomPlayer {
  userId: string;
  username: string;
  ready: boolean;
  score: number;
  status: GameStatus;
  elapsedMs: number;
  combo: number;
  finishedAt?: string;
}

export interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  mode: MultiplayerMode;
  status: RoomStatus;
  seed?: number;
  maxPlayers: number;
  players: RoomPlayer[];
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface RoomResult {
  roomId: string;
  rankings: Array<{
    rank: number;
    userId: string;
    username: string;
    score: number;
    elapsedMs: number;
    status: GameStatus;
  }>;
}

export interface CreateRoomRequest {
  mode: MultiplayerMode;
}

export interface JoinRoomRequest {
  code: string;
}

export interface SetReadyRequest {
  ready: boolean;
}

export interface MultiplayerMoveRequest {
  move: import('./game').Move;
  elapsedMs: number;
}

export interface PlayerUpdatePayload {
  userId: string;
  state: GameState;
  scoreDelta?: number;
}

export interface GameStartedPayload {
  room: GameRoom;
  seed: number;
  yourState: GameState;
}

export const MULTIPLAYER_EVENTS = {
  CREATE_ROOM: 'room:create',
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  SET_READY: 'room:ready',
  START_GAME: 'room:start',
  SUBMIT_MOVE: 'game:move',
  SYNC_ELAPSED: 'game:elapsed',

  ROOM_UPDATED: 'room:updated',
  GAME_STARTED: 'game:started',
  PLAYER_UPDATED: 'player:updated',
  MOVE_RESULT: 'game:moveResult',
  GAME_FINISHED: 'game:finished',
  ERROR: 'error',
} as const;
