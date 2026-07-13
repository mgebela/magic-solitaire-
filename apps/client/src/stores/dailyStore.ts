import { create } from 'zustand';
import { GameEngine, InvalidMoveError } from '@three-towers/game-engine';
import type { DailyChallengeResponse, DailyLeaderboardResponse, GameState } from '@three-towers/shared';
import * as dailyApi from '../lib/daily-api';

interface DailyStore {
  challenge: DailyChallengeResponse | null;
  leaderboard: DailyLeaderboardResponse | null;
  state: GameState | null;
  engine: GameEngine | null;
  gameId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  timerStartedAt: number | null;

  loadChallenge: (accessToken: string) => Promise<void>;
  loadLeaderboard: (date?: string) => Promise<void>;
  startChallenge: (accessToken: string) => Promise<void>;
  playCard: (cardId: string, accessToken: string) => Promise<void>;
  drawCard: (accessToken: string) => Promise<void>;
  tickTimer: () => void;
  clearError: () => void;
  reset: () => void;
}

function syncElapsed(engine: GameEngine, startedAt: number): GameState {
  return engine.setElapsedMs(Date.now() - startedAt);
}

function createEngineForState(state: GameState): GameEngine {
  return new GameEngine({ mode: 'daily', allowUndo: false, seed: state.seed }, state);
}

export const useDailyStore = create<DailyStore>((set, get) => ({
  challenge: null,
  leaderboard: null,
  state: null,
  engine: null,
  gameId: null,
  isLoading: false,
  isSyncing: false,
  error: null,
  timerStartedAt: null,

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      challenge: null,
      leaderboard: null,
      state: null,
      engine: null,
      gameId: null,
      isLoading: false,
      isSyncing: false,
      error: null,
      timerStartedAt: null,
    }),

  loadChallenge: async (accessToken) => {
    set({ isLoading: true, error: null });
    try {
      const challenge = await dailyApi.getTodayChallenge(accessToken);
      const hasActiveState = challenge.state && challenge.attempt?.status === 'playing';

      set({
        challenge,
        state: hasActiveState ? challenge.state! : null,
        engine: hasActiveState ? createEngineForState(challenge.state!) : null,
        gameId: hasActiveState ? challenge.attempt!.gameId : null,
        timerStartedAt: hasActiveState ? Date.now() - (challenge.state!.elapsedMs ?? 0) : null,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load daily challenge',
      });
    }
  },

  loadLeaderboard: async (date) => {
    try {
      const leaderboard = await dailyApi.getDailyLeaderboard(date);
      set({ leaderboard });
    } catch {
      // Leaderboard is non-critical
    }
  },

  startChallenge: async (accessToken) => {
    set({ isLoading: true, error: null });
    try {
      const challenge = await dailyApi.startDailyChallenge(accessToken);
      const state = challenge.state;
      if (!state || !challenge.attempt) {
        throw new Error('Failed to start daily challenge');
      }

      set({
        challenge,
        state,
        engine: createEngineForState(state),
        gameId: challenge.attempt.gameId,
        timerStartedAt: Date.now(),
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to start daily challenge',
      });
    }
  },

  playCard: async (cardId, accessToken) => {
    const { engine, gameId, timerStartedAt } = get();
    if (!engine || !gameId || !timerStartedAt) return;

    const timestamp = Date.now();
    const elapsedMs = timestamp - timerStartedAt;

    try {
      const state = engine.applyMove({ type: 'play', cardId, timestamp });
      engine.setElapsedMs(elapsedMs);
      set({ state, error: null });

      set({ isSyncing: true });
      try {
        const response = await dailyApi.submitDailyMove(
          accessToken,
          gameId,
          { type: 'play', cardId, timestamp },
          elapsedMs,
        );

        if (!response.accepted) {
          set({ error: response.error ?? 'Move rejected by server' });
        } else if (response.state) {
          const synced = response.state;
          set({
            engine: createEngineForState(synced),
            state: synced,
            challenge: get().challenge
              ? {
                  ...get().challenge!,
                  attempt: {
                    gameId,
                    status: synced.status,
                    score: synced.score,
                    elapsedMs: synced.elapsedMs,
                    finishedAt:
                      synced.status !== 'playing' ? new Date().toISOString() : undefined,
                  },
                  canPlay: synced.status === 'playing',
                  state: synced,
                }
              : null,
          });

          if (synced.status !== 'playing') {
            get().loadLeaderboard(get().challenge?.date);
          }
        }
      } finally {
        set({ isSyncing: false });
      }
    } catch (err) {
      const message = err instanceof InvalidMoveError ? err.message : 'Invalid move';
      set({ error: message });
    }
  },

  drawCard: async (accessToken) => {
    const { engine, gameId, timerStartedAt } = get();
    if (!engine || !gameId || !timerStartedAt) return;

    const timestamp = Date.now();
    const elapsedMs = timestamp - timerStartedAt;

    try {
      const state = engine.applyMove({ type: 'draw', timestamp });
      engine.setElapsedMs(elapsedMs);
      set({ state, error: null });

      set({ isSyncing: true });
      try {
        const response = await dailyApi.submitDailyMove(
          accessToken,
          gameId,
          { type: 'draw', timestamp },
          elapsedMs,
        );

        if (!response.accepted) {
          set({ error: response.error ?? 'Move rejected by server' });
        } else if (response.state) {
          const synced = response.state;
          set({
            engine: createEngineForState(synced),
            state: synced,
            challenge: get().challenge
              ? {
                  ...get().challenge!,
                  attempt: {
                    gameId,
                    status: synced.status,
                    score: synced.score,
                    elapsedMs: synced.elapsedMs,
                    finishedAt:
                      synced.status !== 'playing' ? new Date().toISOString() : undefined,
                  },
                  canPlay: synced.status === 'playing',
                  state: synced,
                }
              : null,
          });

          if (synced.status !== 'playing') {
            get().loadLeaderboard(get().challenge?.date);
          }
        }
      } finally {
        set({ isSyncing: false });
      }
    } catch (err) {
      const message = err instanceof InvalidMoveError ? err.message : 'Cannot draw';
      set({ error: message });
    }
  },

  tickTimer: () => {
    const { engine, timerStartedAt, state } = get();
    if (!engine || !timerStartedAt || !state || state.status !== 'playing') return;
    set({ state: syncElapsed(engine, timerStartedAt) });
  },
}));
