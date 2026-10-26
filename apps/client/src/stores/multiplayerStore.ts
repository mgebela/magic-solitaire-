import { create } from 'zustand';
import { GameEngine, InvalidMoveError } from '@three-towers/game-engine';
import type { GameRoom, GameState, MultiplayerMode, RoomResult } from '@three-towers/shared';
import { ensureFirebaseAuth, isFirebaseConfigured, missingFirebaseMessage } from '../lib/firebase';
import {
  createFirebaseRoom,
  joinFirebaseRoom,
  leaveFirebaseRoom,
  patchPlayerHud,
  resultsFromRoom,
  setFirebaseReady,
  startFirebaseRoom,
  stopRoomSubscription,
  subscribeToRoom,
} from '../lib/firebase-rooms';

const HUD_INTERVAL_MS = 1000;

interface MultiplayerStore {
  connected: boolean;
  room: GameRoom | null;
  myState: GameState | null;
  engine: GameEngine | null;
  results: RoomResult | null;
  error: string | null;
  timerStartedAt: number | null;
  userId: string | null;
  username: string | null;

  connect: (username: string) => Promise<void>;
  disconnect: () => void;
  createRoom: (mode: MultiplayerMode) => Promise<GameRoom | null>;
  joinRoom: (code: string) => Promise<GameRoom | null>;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  startGame: () => void;
  playCard: (cardId: string) => void;
  drawCard: () => void;
  tickTimer: () => void;
  clearError: () => void;
  reset: () => void;
}

let lastHudWriteAt = 0;

function messageFrom(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => {
  function writeHud(force = false): void {
    const { room, myState } = get();
    if (!room || !myState) return;
    const now = Date.now();
    if (!force && now - lastHudWriteAt < HUD_INTERVAL_MS) return;
    lastHudWriteAt = now;
    const finished = myState.status === 'won' || myState.status === 'lost';
    void patchPlayerHud(room.code, {
      score: myState.score,
      status: myState.status,
      elapsedMs: myState.elapsedMs,
      combo: myState.combo,
      finishedAt: finished ? new Date().toISOString() : null,
    }).catch((err) => {
      set({ error: messageFrom(err, 'Failed to sync score') });
    });
  }

  function applyRoom(room: GameRoom): void {
    const { engine } = get();
    const results = resultsFromRoom(room);
    const shouldStart = room.status === 'playing' && room.seed != null && !engine;

    if (shouldStart) {
      const gameEngine = new GameEngine({ mode: room.mode, allowUndo: false, seed: room.seed });
      const state = gameEngine.init();
      lastHudWriteAt = 0;
      set({
        room,
        engine: gameEngine,
        myState: state,
        results: null,
        timerStartedAt: Date.now(),
        error: null,
      });
      writeHud(true);
      return;
    }

    set({
      room,
      results: results ?? get().results,
    });
  }

  function listen(code: string): void {
    subscribeToRoom(code, (room) => {
      if (!room) {
        if (get().room) {
          stopRoomSubscription();
          set({
            error: 'Room closed',
            room: null,
            engine: null,
            myState: null,
            results: null,
            timerStartedAt: null,
          });
        }
        return;
      }
      applyRoom(room);
    });
  }

  return {
    connected: false,
    room: null,
    myState: null,
    engine: null,
    results: null,
    error: null,
    timerStartedAt: null,
    userId: null,
    username: null,

    clearError: () => set({ error: null }),

    reset: () =>
      set({
        room: null,
        myState: null,
        engine: null,
        results: null,
        error: null,
        timerStartedAt: null,
      }),

    connect: async (username) => {
      if (get().connected && get().userId && get().username === username) {
        return;
      }

      if (!isFirebaseConfigured()) {
        set({ connected: false, userId: null, username, error: missingFirebaseMessage() });
        return;
      }

      try {
        const uid = await ensureFirebaseAuth();
        set({ connected: true, userId: uid, username, error: null });
      } catch (err) {
        set({
          connected: false,
          error: messageFrom(err, missingFirebaseMessage()),
        });
      }
    },

    disconnect: () => {
      const { room } = get();
      stopRoomSubscription();
      if (room) {
        void leaveFirebaseRoom(room.code);
      }
      lastHudWriteAt = 0;
      set({
        connected: false,
        room: null,
        myState: null,
        engine: null,
        results: null,
        timerStartedAt: null,
      });
    },

    createRoom: async (mode) => {
      const { username, connected } = get();
      if (!connected) {
        set({ error: 'Not connected' });
        return null;
      }
      try {
        const room = await createFirebaseRoom(mode, username ?? 'player');
        listen(room.code);
        set({ room, results: null, error: null, engine: null, myState: null, timerStartedAt: null });
        return room;
      } catch (err) {
        set({ error: messageFrom(err, 'Could not create room') });
        return null;
      }
    },

    joinRoom: async (code) => {
      const { username, connected, room } = get();
      const normalized = code.trim().toUpperCase();
      if (room?.code === normalized) return room;
      if (!connected) {
        set({ error: 'Not connected' });
        return null;
      }
      try {
        const joined = await joinFirebaseRoom(normalized, username ?? 'player');
        set({
          room: joined,
          results: null,
          error: null,
          engine: null,
          myState: null,
          timerStartedAt: null,
        });
        listen(joined.code);
        applyRoom(joined);
        return get().room;
      } catch (err) {
        set({ error: messageFrom(err, 'Could not join room') });
        return null;
      }
    },

    leaveRoom: () => {
      const { room } = get();
      stopRoomSubscription();
      if (room) {
        void leaveFirebaseRoom(room.code);
      }
      lastHudWriteAt = 0;
      get().reset();
    },

    setReady: (ready) => {
      const { room } = get();
      if (!room) return;
      void setFirebaseReady(room.code, ready).catch((err) => {
        set({ error: messageFrom(err, 'Could not update ready') });
      });
    },

    startGame: () => {
      const { room } = get();
      if (!room) return;
      void startFirebaseRoom(room.code).catch((err) => {
        set({ error: messageFrom(err, 'Could not start game') });
      });
    },

    playCard: (cardId) => {
      const { engine, timerStartedAt, room } = get();
      if (!engine || !timerStartedAt || !room) return;

      const timestamp = Date.now();
      const elapsedMs = timestamp - timerStartedAt;

      try {
        const state = engine.applyMove({ type: 'play', cardId, timestamp });
        engine.setElapsedMs(elapsedMs);
        set({ myState: state, error: null });
        writeHud(true);
      } catch (err) {
        const message = err instanceof InvalidMoveError ? err.message : 'Invalid move';
        set({ error: message });
      }
    },

    drawCard: () => {
      const { engine, timerStartedAt, room } = get();
      if (!engine || !timerStartedAt || !room) return;

      const timestamp = Date.now();
      const elapsedMs = timestamp - timerStartedAt;

      try {
        const state = engine.applyMove({ type: 'draw', timestamp });
        engine.setElapsedMs(elapsedMs);
        set({ myState: state, error: null });
        writeHud(true);
      } catch (err) {
        const message = err instanceof InvalidMoveError ? err.message : 'Cannot draw';
        set({ error: message });
      }
    },

    tickTimer: () => {
      const { engine, timerStartedAt, myState, room } = get();
      if (!engine || !timerStartedAt || !myState || myState.status !== 'playing' || !room) return;

      const elapsedMs = Date.now() - timerStartedAt;
      const state = engine.setElapsedMs(elapsedMs);
      set({ myState: state });
      writeHud(false);
    },
  };
});
