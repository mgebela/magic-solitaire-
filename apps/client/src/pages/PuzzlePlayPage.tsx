import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getPuzzleById, movesRemaining } from '@three-towers/shared';
import { GameCanvas } from '../components/GameCanvas';
import { PuzzleResultModal } from '../components/PuzzleResultModal';
import { StarRating } from '../components/StarRating';
import { usePuzzleStore } from '../stores/puzzleStore';

export default function PuzzlePlayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const puzzle = id ? getPuzzleById(id) : undefined;

  const {
    activePuzzle,
    state,
    lastResult,
    error,
    startPuzzle,
    playCard,
    drawCard,
    resetActive,
    clearError,
  } = usePuzzleStore();

  useEffect(() => {
    if (puzzle && (!activePuzzle || activePuzzle.id !== puzzle.id)) {
      startPuzzle(puzzle.id);
    }
  }, [puzzle, activePuzzle, startPuzzle]);

  useEffect(() => () => resetActive(), [resetActive]);

  if (!puzzle) {
    return <Navigate to="/puzzles" replace />;
  }

  const movesLeft = state?.moveLimit
    ? movesRemaining(state.moveLimit, state.moves.length)
    : puzzle.moveLimit;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-felt-dark)]">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link to="/puzzles" className="text-[var(--color-gold)] hover:opacity-80">
          ← Puzzles
        </Link>

        <div className="text-center">
          <div className="font-semibold text-white">{puzzle.title}</div>
          <div className="text-xs capitalize text-white/50">{puzzle.difficulty}</div>
        </div>

        {state && (
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span>
              Moves:{' '}
              <strong className={movesLeft <= 3 ? 'text-red-400' : 'text-white'}>
                {movesLeft}
              </strong>
              <span className="text-white/40"> / {state.moveLimit}</span>
            </span>
            <span>
              Cleared: <strong className="text-white">{state.foundation.length}</strong>/28
            </span>
          </div>
        )}
      </header>

      {error && (
        <div className="mx-6 mt-4 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-200 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <main className="relative flex-1 p-4">
        <div className="mb-4 flex items-center justify-center gap-6 text-xs text-white/50">
          <span>★★★ ≤ {puzzle.starThresholds.three} moves</span>
          <span>★★ ≤ {puzzle.starThresholds.two} moves</span>
          <span>★ win within {puzzle.moveLimit}</span>
        </div>

        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10">
          <GameCanvas
            state={state}
            onCardClick={playCard}
            className="h-[min(70vh,560px)] w-full"
          />
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => drawCard()}
            disabled={!state || state.status !== 'playing' || state.stock.length === 0}
            className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Draw
          </button>
          <button
            type="button"
            onClick={() => startPuzzle(puzzle.id)}
            className="rounded-lg border border-white/10 px-6 py-2 text-sm font-medium text-white/80 hover:bg-white/5"
          >
            Restart
          </button>
        </div>

        {lastResult && (
          <PuzzleResultModal
            result={lastResult}
            title={puzzle.title}
            onRetry={() => startPuzzle(puzzle.id)}
            onBack={() => navigate('/puzzles')}
          />
        )}
      </main>

      {state?.starsEarned !== undefined && state.status === 'won' && !lastResult && (
        <div className="border-t border-white/10 p-4 text-center">
          <StarRating stars={state.starsEarned} />
        </div>
      )}
    </div>
  );
}
