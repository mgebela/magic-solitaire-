import { create } from 'zustand';
import { GameEngine, InvalidMoveError, getHint } from '@three-towers/game-engine';
import type { GameState, Move, SinglePlayerMode } from '@three-towers/shared';
import * as gameApi from '../lib/game-api';

interface GameStore {
  state: GameState | null;
  engine: GameEngine | null;
  mode: SinglePlayerMode | null;
  gameId: string | null;
  persisted: boolean;
  allowUndo: boolean;
  isStarting: boolean;
  isSyncing: boolean;
  error: string | null;
  timerStartedAt: number | null;
  hintCardId: string | null;
  hintDraw: boolean;
  startGame: (mode: SinglePlayerMode, accessToken?: string, seed?: number) => Promise<void>;
  playCard: (cardId: string, accessToken?: string) => Promise<void>;
  playWild: (cardId: string, accessToken?: string) => Promise<void>;
  keepWild: (accessToken?: string) => Promise<void>;
  discardWild: (accessToken?: string) => Promise<void>;
  drawCard: (accessToken?: string) => Promise<void>;
  undoMove: () => void;
  requestHint: () => void;
  clearHint: () => void;
  tickTimer: () => void;
  resetToModeSelect: () => void;
  clearError: () => void;
}

function syncElapsed(engine: GameEngine, startedAt: number): GameState {
  const elapsedMs = Date.now() - startedAt;
  return engine.setElapsedMs(elapsedMs);
}

async function commitMove(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
  move: Move,
  accessToken?: string,
) {
  const { engine, gameId, timerStartedAt } = get();
  if (!engine || !timerStartedAt) return;

  const elapsedMs = Date.now() - timerStartedAt;

  try {
    engine.applyMove(move);
    engine.setElapsedMs(elapsedMs);
    set({ state: engine.getState(), error: null, hintCardId: null, hintDraw: false });

    if (gameId && accessToken) {
      set({ isSyncing: true });
      try {
        const response = await gameApi.submitMove(accessToken, gameId, move, elapsedMs);
        if (!response.accepted || response.state) {
          const syncedState = response.state ?? (await gameApi.getGame(accessToken, gameId)).state;
          if (!response.accepted) {
            set({
              engine: createEngineForState(
                syncedState,
                get().mode ?? (syncedState.mode as SinglePlayerMode),
                false,
              ),
              state: syncedState,
              error: response.error ?? 'Move rejected by server',
            });
          } else if (response.state) {
            set({
              engine: createEngineForState(
                response.state,
                get().mode ?? (response.state.mode as SinglePlayerMode),
                false,
              ),
              state: response.state,
            });
          }
        }
      } finally {
        set({ isSyncing: false });
      }
    }
  } catch (err) {
    const message = err instanceof InvalidMoveError ? err.message : 'Invalid move';
    set({ error: message });
  }
}

function createEngineForState(
  state: GameState,
  mode: SinglePlayerMode,
  allowUndo: boolean,
): GameEngine {
  return new GameEngine({ mode, allowUndo, seed: state.seed }, state);
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  engine: null,
  mode: null,
  gameId: null,
  persisted: false,
  allowUndo: false,
  isStarting: false,
  isSyncing: false,
  error: null,
  timerStartedAt: null,
  hintCardId: null,
  hintDraw: false,

  clearError: () => set({ error: null }),

  clearHint: () => set({ hintCardId: null, hintDraw: false }),

  resetToModeSelect: () =>
    set({
      state: null,
      engine: null,
      mode: null,
      gameId: null,
      persisted: false,
      allowUndo: false,
      isStarting: false,
      isSyncing: false,
      error: null,
      timerStartedAt: null,
      hintCardId: null,
      hintDraw: false,
    }),

  tickTimer: () => {
    const { engine, timerStartedAt, state } = get();
    if (!engine || !timerStartedAt || !state || state.status !== 'playing') return;

    const nextState = syncElapsed(engine, timerStartedAt);
    set({ state: nextState });
  },

  startGame: async (mode, accessToken, seed) => {
    set({ isStarting: true, error: null, mode, hintCardId: null, hintDraw: false });

    try {
      if (accessToken) {
        const session = await gameApi.createGame(accessToken, { mode, seed });
        const state = { ...session.state, mode };
        const engine = createEngineForState(state, mode, false);

        set({
          engine,
          state,
          gameId: session.id,
          persisted: true,
          allowUndo: false,
          timerStartedAt: Date.now(),
          isStarting: false,
        });
        return;
      }

      const engine = new GameEngine({ mode, allowUndo: true, seed });
      const state = engine.init();

      set({
        engine,
        state,
        gameId: null,
        persisted: false,
        allowUndo: true,
        timerStartedAt: Date.now(),
        isStarting: false,
      });
    } catch (err) {
      set({
        isStarting: false,
        error: err instanceof Error ? err.message : 'Failed to start game',
      });
      throw err;
    }
  },

  playCard: async (cardId, accessToken) => {
    const { engine, gameId, timerStartedAt } = get();
    if (!engine || !timerStartedAt) return;

    const timestamp = Date.now();
    const elapsedMs = timestamp - timerStartedAt;

    try {
      const state = engine.applyMove({ type: 'play', cardId, timestamp });
      engine.setElapsedMs(elapsedMs);
      set({ state, error: null, hintCardId: null, hintDraw: false });

      if (gameId && accessToken) {
        set({ isSyncing: true });
        try {
          const response = await gameApi.submitMove(accessToken, gameId, {
            type: 'play',
            cardId,
            timestamp,
          }, elapsedMs);

          if (!response.accepted) {
            const session = await gameApi.getGame(accessToken, gameId);
            const syncedState = session.state;
            set({
              engine: createEngineForState(
                syncedState,
                get().mode ?? (syncedState.mode as SinglePlayerMode),
                false,
              ),
              state: syncedState,
              error: response.error ?? 'Move rejected by server',
            });
          } else if (response.state) {
            const syncedState = response.state;
            set({
              engine: createEngineForState(
                syncedState,
                get().mode ?? (syncedState.mode as SinglePlayerMode),
                false,
              ),
              state: syncedState,
            });
          }
        } finally {
          set({ isSyncing: false });
        }
      }
    } catch (err) {
      const message = err instanceof InvalidMoveError ? err.message : 'Invalid move';
      set({ error: message });
    }
  },

  playWild: async (cardId, accessToken) => {
    await commitMove(set, get, { type: 'play', cardId: `~wild:${cardId}`, timestamp: Date.now() }, accessToken);
  },

  keepWild: async (accessToken) => {
    await commitMove(set, get, { type: 'play', cardId: '~wild-keep', timestamp: Date.now() }, accessToken);
  },

  discardWild: async (accessToken) => {
    await commitMove(set, get, { type: 'play', cardId: '~wild-discard', timestamp: Date.now() }, accessToken);
  },

  drawCard: async (accessToken) => {
    const { engine, gameId, timerStartedAt } = get();
    if (!engine || !timerStartedAt) return;

    const timestamp = Date.now();
    const elapsedMs = timestamp - timerStartedAt;

    try {
      const state = engine.applyMove({ type: 'draw', timestamp });
      engine.setElapsedMs(elapsedMs);
      set({ state, error: null, hintCardId: null, hintDraw: false });

      if (gameId && accessToken) {
        set({ isSyncing: true });
        try {
          const response = await gameApi.submitMove(accessToken, gameId, {
            type: 'draw',
            timestamp,
          }, elapsedMs);

          if (!response.accepted) {
            const session = await gameApi.getGame(accessToken, gameId);
            const syncedState = session.state;
            set({
              engine: createEngineForState(
                syncedState,
                get().mode ?? (syncedState.mode as SinglePlayerMode),
                false,
              ),
              state: syncedState,
              error: response.error ?? 'Move rejected by server',
            });
          } else if (response.state) {
            const syncedState = response.state;
            set({
              engine: createEngineForState(
                syncedState,
                get().mode ?? (syncedState.mode as SinglePlayerMode),
                false,
              ),
              state: syncedState,
            });
          }
        } finally {
          set({ isSyncing: false });
        }
      }
    } catch (err) {
      const message = err instanceof InvalidMoveError ? err.message : 'Cannot draw';
      set({ error: message });
    }
  },

  undoMove: () => {
    const { engine, timerStartedAt } = get();
    if (!engine || !timerStartedAt) return;

    try {
      const state = engine.undo();
      engine.setElapsedMs(Date.now() - timerStartedAt);
      set({ state, error: null, hintCardId: null, hintDraw: false });
    } catch (err) {
      const message = err instanceof InvalidMoveError ? err.message : 'Cannot undo';
      set({ error: message });
    }
  },

  requestHint: () => {
    const { engine } = get();
    if (!engine) return;

    const hint: Move | null = getHint(engine);
    if (!hint) {
      set({ hintCardId: null, hintDraw: false });
      return;
    }

    if (hint.type === 'play') {
      set({ hintCardId: hint.cardId, hintDraw: false });
      return;
    }

    set({ hintCardId: null, hintDraw: hint.type === 'draw' });
  },
}));
