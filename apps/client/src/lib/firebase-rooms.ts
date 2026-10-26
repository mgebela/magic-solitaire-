import { get, onValue, ref, remove, set, update } from 'firebase/database';
import type {
  GameRoom,
  GameStatus,
  MultiplayerMode,
  RoomPlayer,
  RoomResult,
  RoomStatus,
} from '@three-towers/shared';
import { ensureFirebaseAuth, getFirebaseDb } from './firebase';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_PLAYERS = 4;

interface FirebasePlayerRecord {
  userId: string;
  username: string;
  ready: boolean;
  score: number;
  status: GameStatus;
  elapsedMs: number;
  combo: number;
  finishedAt?: string | null;
}

interface FirebaseRoomRecord {
  id: string;
  code: string;
  hostId: string;
  mode: MultiplayerMode;
  status: RoomStatus;
  seed?: number | null;
  maxPlayers: number;
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  players?: Record<string, FirebasePlayerRecord>;
  rankings?: RoomResult['rankings'];
}

export interface PlayerHudPatch {
  ready?: boolean;
  score?: number;
  status?: GameStatus;
  elapsedMs?: number;
  combo?: number;
  finishedAt?: string | null;
}

let unsubscribeRoom: (() => void) | null = null;

function randomCode(): string {
  return Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(
    '',
  );
}

function defaultPlayer(uid: string, username: string): FirebasePlayerRecord {
  return {
    userId: uid,
    username,
    ready: false,
    score: 0,
    status: 'idle',
    elapsedMs: 0,
    combo: 0,
  };
}

function toGameRoom(code: string, data: FirebaseRoomRecord): GameRoom {
  const players: RoomPlayer[] = Object.entries(data.players ?? {}).map(([uid, player]) => ({
    userId: player.userId || uid,
    username: player.username,
    ready: Boolean(player.ready),
    score: player.score ?? 0,
    status: player.status ?? 'idle',
    elapsedMs: player.elapsedMs ?? 0,
    combo: player.combo ?? 0,
    finishedAt: player.finishedAt ?? undefined,
  }));

  return {
    id: data.id || code,
    code: data.code || code,
    hostId: data.hostId,
    mode: data.mode,
    status: data.status,
    seed: data.seed ?? undefined,
    maxPlayers: data.maxPlayers ?? MAX_PLAYERS,
    players,
    createdAt: data.createdAt,
    startedAt: data.startedAt ?? undefined,
    finishedAt: data.finishedAt ?? undefined,
  };
}

export function resultsFromRoom(room: GameRoom): RoomResult | null {
  if (room.players.length === 0) return null;
  const allDone = room.players.every((player) => player.status === 'won' || player.status === 'lost');
  if (!allDone) return null;

  const rankings = [...room.players]
    .map((player) => ({
      userId: player.userId,
      username: player.username,
      score: player.score,
      elapsedMs: player.elapsedMs,
      status: player.status,
      won: player.status === 'won',
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

export function stopRoomSubscription(): void {
  unsubscribeRoom?.();
  unsubscribeRoom = null;
}

export function subscribeToRoom(code: string, onRoom: (room: GameRoom | null) => void): () => void {
  stopRoomSubscription();
  const roomRef = ref(getFirebaseDb(), `rooms/${code}`);
  unsubscribeRoom = onValue(
    roomRef,
    (snap) => {
      if (!snap.exists()) {
        onRoom(null);
        return;
      }
      onRoom(toGameRoom(code, snap.val() as FirebaseRoomRecord));
    },
    () => onRoom(null),
  );
  return stopRoomSubscription;
}

export async function createFirebaseRoom(mode: MultiplayerMode, username: string): Promise<GameRoom> {
  const uid = await ensureFirebaseAuth();
  const db = getFirebaseDb();
  let lastError: unknown;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomCode();
    const now = new Date().toISOString();
    const record: FirebaseRoomRecord = {
      id: crypto.randomUUID(),
      code,
      hostId: uid,
      mode,
      status: 'waiting',
      maxPlayers: MAX_PLAYERS,
      createdAt: now,
      players: { [uid]: defaultPlayer(uid, username) },
    };

    try {
      await set(ref(db, `rooms/${code}`), record);
      return toGameRoom(code, record);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Could not create a room');
}

export async function joinFirebaseRoom(code: string, username: string): Promise<GameRoom> {
  const uid = await ensureFirebaseAuth();
  const normalized = code.trim().toUpperCase();
  const db = getFirebaseDb();
  const roomRef = ref(db, `rooms/${normalized}`);
  const snap = await get(roomRef);
  if (!snap.exists()) {
    throw new Error('Room not found');
  }

  const data = snap.val() as FirebaseRoomRecord;
  const players = data.players ?? {};

  if (players[uid]) {
    await update(ref(db, `rooms/${normalized}/players/${uid}`), { username });
    return toGameRoom(normalized, {
      ...data,
      players: { ...players, [uid]: { ...players[uid], username } },
    });
  }

  if (data.status !== 'waiting') {
    throw new Error('Game already in progress');
  }
  if (Object.keys(players).length >= (data.maxPlayers ?? MAX_PLAYERS)) {
    throw new Error('Room is full');
  }

  const player = defaultPlayer(uid, username);
  await set(ref(db, `rooms/${normalized}/players/${uid}`), player);
  return toGameRoom(normalized, { ...data, players: { ...players, [uid]: player } });
}

export async function leaveFirebaseRoom(code: string): Promise<void> {
  const uid = await ensureFirebaseAuth();
  const db = getFirebaseDb();
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) return;

  const data = snap.val() as FirebaseRoomRecord;
  if (data.hostId === uid && data.status === 'waiting') {
    await remove(roomRef);
    return;
  }

  await remove(ref(db, `rooms/${code}/players/${uid}`));
}

export async function setFirebaseReady(code: string, ready: boolean): Promise<void> {
  const uid = await ensureFirebaseAuth();
  await update(ref(getFirebaseDb(), `rooms/${code}/players/${uid}`), { ready });
}

export async function startFirebaseRoom(code: string): Promise<void> {
  const uid = await ensureFirebaseAuth();
  const db = getFirebaseDb();
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) {
    throw new Error('Room not found');
  }

  const data = snap.val() as FirebaseRoomRecord;
  if (data.hostId !== uid) {
    throw new Error('Only the host can start');
  }
  if (data.status !== 'waiting') return;

  const players = Object.values(data.players ?? {});
  if (players.length < 2) {
    throw new Error('Need at least 2 players');
  }
  if (!players.every((player) => player.ready)) {
    throw new Error('All players must be ready');
  }

  await update(roomRef, {
    status: 'playing',
    seed: Math.floor(Math.random() * 2_147_483_647) + 1,
    startedAt: new Date().toISOString(),
  });
}

export async function patchPlayerHud(code: string, patch: PlayerHudPatch): Promise<void> {
  const uid = await ensureFirebaseAuth();
  await update(ref(getFirebaseDb(), `rooms/${code}/players/${uid}`), patch);
}
