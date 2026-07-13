import { create } from 'zustand';
import { GameEngine, InvalidMoveError } from '@three-towers/game-engine';
import {
  MULTIPLAYER_EVENTS,
  type GameRoom,
  type GameStartedPayload,
  type GameState,
  type MultiplayerMode,
  type PlayerUpdatePayload,
  type RoomResult,
} from '@three-towers/shared';
import { disconnectMultiplayerSocket, getMultiplayerSocket, getSocket } from '../lib/socket';

interface MultiplayerStore {
  connected: boolean;
  room: GameRoom | null;
  myState: GameState | null;
  engine: GameEngine | null;
  opponentStates: Record<string, GameState>;
  results: RoomResult | null;
  error: string | null;
  timerStartedAt: number | null;
  userId: string | null;

  connect: (accessToken: string, userId: string) => void;
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

function createEngineForState(state: GameState, mode: MultiplayerMode): GameEngine {
  return new GameEngine({ mode, allowUndo: false, seed: state.seed }, state);
}

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  connected: false,
  room: null,
  myState: null,
  engine: null,
  opponentStates: {},
  results: null,
  error: null,
  timerStartedAt: null,
  userId: null,

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      room: null,
      myState: null,
      engine: null,
      opponentStates: {},
      results: null,
      error: null,
      timerStartedAt: null,
    }),

  connect: (accessToken, userId) => {
    const socket = getMultiplayerSocket(accessToken);

    socket.off(MULTIPLAYER_EVENTS.ROOM_UPDATED);
    socket.off(MULTIPLAYER_EVENTS.GAME_STARTED);
    socket.off(MULTIPLAYER_EVENTS.PLAYER_UPDATED);
    socket.off(MULTIPLAYER_EVENTS.GAME_FINISHED);
    socket.off(MULTIPLAYER_EVENTS.ERROR);

    socket.on('connect', () => set({ connected: true, userId }));
    socket.on('disconnect', () => set({ connected: false }));

    socket.on(MULTIPLAYER_EVENTS.ROOM_UPDATED, (room: GameRoom) => {
      set({ room });
    });

    socket.on(MULTIPLAYER_EVENTS.GAME_STARTED, (payload: GameStartedPayload) => {
      const engine = createEngineForState(payload.yourState, payload.room.mode);
      set({
        room: payload.room,
        myState: payload.yourState,
        engine,
        opponentStates: {},
        results: null,
        timerStartedAt: Date.now(),
      });
    });

    socket.on(MULTIPLAYER_EVENTS.PLAYER_UPDATED, (payload: PlayerUpdatePayload) => {
      const { userId: myId } = get();
      if (payload.userId === myId) {
        const room = get().room;
        if (room) {
          const engine = createEngineForState(payload.state, room.mode);
          set({ myState: payload.state, engine });
        }
      } else {
        set((s) => ({
          opponentStates: { ...s.opponentStates, [payload.userId]: payload.state },
        }));
      }
    });

    socket.on(MULTIPLAYER_EVENTS.GAME_FINISHED, (results: RoomResult) => {
      set({ results });
    });

    socket.on(MULTIPLAYER_EVENTS.ERROR, (payload: { message: string }) => {
      set({ error: payload.message });
    });

    if (!socket.connected) {
      socket.connect();
    } else {
      set({ connected: true, userId });
    }
  },

  disconnect: () => {
    disconnectMultiplayerSocket();
    set({ connected: false });
  },

  createRoom: async (mode) => {
    const socket = getSocket();
    if (!socket) {
      set({ error: 'Not connected' });
      return null;
    }
    return new Promise((resolve) => {
      socket.emit(MULTIPLAYER_EVENTS.CREATE_ROOM, { mode }, (response: { room?: GameRoom; error?: string }) => {
        if (response.error) {
          set({ error: response.error });
          resolve(null);
          return;
        }
        if (response.room) {
          set({ room: response.room, results: null });
          resolve(response.room);
        }
      });
    });
  },

  joinRoom: async (code) => {
    const socket = getSocket();
    if (!socket) {
      set({ error: 'Not connected' });
      return null;
    }
    return new Promise((resolve) => {
      socket.emit(MULTIPLAYER_EVENTS.JOIN_ROOM, { code }, (response: { room?: GameRoom; error?: string }) => {
        if (response.error) {
          set({ error: response.error });
          resolve(null);
          return;
        }
        if (response.room) {
          set({ room: response.room, results: null });
          resolve(response.room);
        }
      });
    });
  },

  leaveRoom: () => {
    getSocket()?.emit(MULTIPLAYER_EVENTS.LEAVE_ROOM);
    get().reset();
  },

  setReady: (ready) => {
    getSocket()?.emit(MULTIPLAYER_EVENTS.SET_READY, { ready });
  },

  startGame: () => {
    getSocket()?.emit(MULTIPLAYER_EVENTS.START_GAME);
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

      const socket = getSocket();
      socket?.emit(
        MULTIPLAYER_EVENTS.SUBMIT_MOVE,
        { move: { type: 'play', cardId, timestamp }, elapsedMs },
        (result: { accepted?: boolean; error?: string }) => {
          if (result && !result.accepted && result.error) {
            set({ error: result.error });
          }
        },
      );
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

      const socket = getSocket();
      socket?.emit(
        MULTIPLAYER_EVENTS.SUBMIT_MOVE,
        { move: { type: 'draw', timestamp }, elapsedMs },
        (result: { accepted?: boolean; error?: string }) => {
          if (result && !result.accepted && result.error) {
            set({ error: result.error });
          }
        },
      );
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
  },
}));
