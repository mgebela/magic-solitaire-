import { create } from 'zustand';
import {
  GameEngine,
  InvalidMoveError,
  chooseAiMove,
  getAiThinkDelay,
  type AiDifficulty,
} from '@three-towers/game-engine';
import type { GameState } from '@three-towers/shared';

interface AiGameStore {
  playerState: GameState | null;
  playerEngine: GameEngine | null;
  aiState: GameState | null;
  aiEngine: GameEngine | null;
  difficulty: AiDifficulty | null;
  error: string | null;
  playerTimerStartedAt: number | null;
  aiTimeoutId: ReturnType<typeof setTimeout> | null;

  startGame: (difficulty: AiDifficulty, seed?: number) => void;
  playCard: (cardId: string) => void;
  drawCard: () => void;
  tickPlayerTimer: () => void;
  scheduleAiTurn: () => void;
  stopAi: () => void;
  reset: () => void;
  clearError: () => void;
}

function syncElapsed(engine: GameEngine, startedAt: number): GameState {
  return engine.setElapsedMs(Date.now() - startedAt);
}

export const useAiGameStore = create<AiGameStore>((set, get) => ({
  playerState: null,
  playerEngine: null,
  aiState: null,
  aiEngine: null,
  difficulty: null,
  error: null,
  playerTimerStartedAt: null,
  aiTimeoutId: null,

  clearError: () => set({ error: null }),

  stopAi: () => {
    const { aiTimeoutId } = get();
    if (aiTimeoutId) clearTimeout(aiTimeoutId);
    set({ aiTimeoutId: null });
  },

  reset: () => {
    get().stopAi();
    set({
      playerState: null,
      playerEngine: null,
      aiState: null,
      aiEngine: null,
      difficulty: null,
      error: null,
      playerTimerStartedAt: null,
    });
  },

  scheduleAiTurn: () => {
    const { aiEngine, difficulty, aiTimeoutId } = get();
    if (!aiEngine || !difficulty || aiTimeoutId) return;

    const aiState = aiEngine.getState();
    if (aiState.status !== 'playing') return;

    const delay = getAiThinkDelay(difficulty);
    const timeoutId = setTimeout(() => {
      set({ aiTimeoutId: null });

      const { aiEngine: engine, difficulty: level } = get();
      if (!engine || !level) return;

      const move = chooseAiMove(engine, level);
      if (!move) return;

      try {
        const before = engine.getState();
        engine.applyMove(move);
        const after = engine.getState();
        const elapsedMs = before.elapsedMs + delay;
        engine.setElapsedMs(elapsedMs);

        set({ aiState: engine.getState() });

        if (after.status === 'playing') {
          get().scheduleAiTurn();
        }
      } catch {
        // AI should only pick valid moves; ignore unexpected errors
      }
    }, delay);

    set({ aiTimeoutId: timeoutId });
  },

  startGame: (difficulty, seed) => {
    get().stopAi();

    const config = {
      mode: 'practice' as const,
      allowUndo: false,
      seed,
      difficulty,
    };

    const playerEngine = new GameEngine(config);
    const aiEngine = new GameEngine(config);

    const playerState = playerEngine.init();
    const aiState = aiEngine.init();

    set({
      playerEngine,
      aiEngine,
      playerState,
      aiState,
      difficulty,
      error: null,
      playerTimerStartedAt: Date.now(),
    });

    get().scheduleAiTurn();
  },

  playCard: (cardId) => {
    const { playerEngine, playerTimerStartedAt } = get();
    if (!playerEngine || !playerTimerStartedAt) return;

    const timestamp = Date.now();
    const elapsedMs = timestamp - playerTimerStartedAt;

    try {
      const state = playerEngine.applyMove({ type: 'play', cardId, timestamp });
      playerEngine.setElapsedMs(elapsedMs);
      set({ playerState: state, error: null });
    } catch (err) {
      const message = err instanceof InvalidMoveError ? err.message : 'Invalid move';
      set({ error: message });
    }
  },

  drawCard: () => {
    const { playerEngine, playerTimerStartedAt } = get();
    if (!playerEngine || !playerTimerStartedAt) return;

    const timestamp = Date.now();
    const elapsedMs = timestamp - playerTimerStartedAt;

    try {
      const state = playerEngine.applyMove({ type: 'draw', timestamp });
      playerEngine.setElapsedMs(elapsedMs);
      set({ playerState: state, error: null });
    } catch (err) {
      const message = err instanceof InvalidMoveError ? err.message : 'Cannot draw';
      set({ error: message });
    }
  },

  tickPlayerTimer: () => {
    const { playerEngine, playerTimerStartedAt, playerState } = get();
    if (!playerEngine || !playerTimerStartedAt || !playerState || playerState.status !== 'playing') {
      return;
    }

    set({ playerState: syncElapsed(playerEngine, playerTimerStartedAt) });
  },
}));
