import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameEngine, InvalidMoveError } from '@three-towers/game-engine';
import type { GameState, PuzzleDefinition, PuzzleProgress, PuzzleResult, PuzzleStars } from '@three-towers/shared';
import { getPuzzleById } from '@three-towers/shared';

interface PuzzleStore {
  progress: Record<string, PuzzleProgress>;
  activePuzzle: PuzzleDefinition | null;
  state: GameState | null;
  engine: GameEngine | null;
  lastResult: PuzzleResult | null;
  error: string | null;

  startPuzzle: (puzzleId: string) => void;
  playCard: (cardId: string) => void;
  drawCard: () => void;
  resetActive: () => void;
  getProgress: (puzzleId: string) => PuzzleProgress | null;
  clearError: () => void;
}

function recordResult(
  progress: Record<string, PuzzleProgress>,
  puzzle: PuzzleDefinition,
  state: GameState,
): { progress: Record<string, PuzzleProgress>; result: PuzzleResult } {
  const movesUsed = state.moves.length;
  const won = state.status === 'won';
  const stars = (state.starsEarned ?? 0) as PuzzleStars;
  const existing = progress[puzzle.id];
  const isNewBest = !existing || stars > existing.bestStars;

  const next: PuzzleProgress = {
    puzzleId: puzzle.id,
    bestStars: isNewBest ? stars : existing.bestStars,
    bestMoves: isNewBest && won ? movesUsed : existing?.bestMoves ?? (won ? movesUsed : null),
    completedAt: won ? new Date().toISOString() : existing?.completedAt,
  };

  return {
    progress: { ...progress, [puzzle.id]: next },
    result: {
      puzzleId: puzzle.id,
      stars,
      movesUsed,
      moveLimit: puzzle.moveLimit,
      won,
      isNewBest: isNewBest && stars > 0,
    },
  };
}

export const usePuzzleStore = create<PuzzleStore>()(
  persist(
    (set, get) => ({
      progress: {},
      activePuzzle: null,
      state: null,
      engine: null,
      lastResult: null,
      error: null,

      clearError: () => set({ error: null }),

      getProgress: (puzzleId) => get().progress[puzzleId] ?? null,

      resetActive: () =>
        set({
          activePuzzle: null,
          state: null,
          engine: null,
          lastResult: null,
          error: null,
        }),

      startPuzzle: (puzzleId) => {
        const puzzle = getPuzzleById(puzzleId);
        if (!puzzle) {
          set({ error: 'Puzzle not found' });
          return;
        }

        const engine = new GameEngine({
          mode: 'puzzle',
          allowUndo: false,
          seed: puzzle.seed,
          moveLimit: puzzle.moveLimit,
          puzzleId: puzzle.id,
          starThresholds: puzzle.starThresholds,
        });

        const state = engine.init();

        set({
          activePuzzle: puzzle,
          engine,
          state,
          lastResult: null,
          error: null,
        });
      },

      playCard: (cardId) => {
        const { engine, activePuzzle } = get();
        if (!engine || !activePuzzle) return;

        try {
          const state = engine.applyMove({ type: 'play', cardId, timestamp: Date.now() });
          const updates: Partial<PuzzleStore> = { state, error: null };

          if (state.status !== 'playing') {
            const { progress, result } = recordResult(get().progress, activePuzzle, state);
            updates.progress = progress;
            updates.lastResult = result;
          }

          set(updates);
        } catch (err) {
          const message = err instanceof InvalidMoveError ? err.message : 'Invalid move';
          set({ error: message });
        }
      },

      drawCard: () => {
        const { engine, activePuzzle } = get();
        if (!engine || !activePuzzle) return;

        try {
          const state = engine.applyMove({ type: 'draw', timestamp: Date.now() });
          const updates: Partial<PuzzleStore> = { state, error: null };

          if (state.status !== 'playing') {
            const { progress, result } = recordResult(get().progress, activePuzzle, state);
            updates.progress = progress;
            updates.lastResult = result;
          }

          set(updates);
        } catch (err) {
          const message = err instanceof InvalidMoveError ? err.message : 'Cannot draw';
          set({ error: message });
        }
      },
    }),
    {
      name: 'three-towers-puzzle-progress',
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
);
