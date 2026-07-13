import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getPuzzleById, movesRemaining } from '@three-towers/shared';
import { GameCanvas } from '../components/GameCanvas';
import { PuzzleResultModal } from '../components/PuzzleResultModal';
import { GameShell } from '../components/layout/GameShell';
import { GameButton } from '../components/ui/GameButton';
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

  const toolbar = state ? (
    <>
      <span className="mode-badge">{puzzle.title}</span>
      <span className="stat-pill">
        Moves{' '}
        <strong className={movesLeft <= 3 ? 'text-red-400' : ''}>
          {movesLeft}/{state.moveLimit}
        </strong>
      </span>
      <span className="stat-pill">
        Cleared <strong>{state.foundation.length}/28</strong>
      </span>
    </>
  ) : null;

  const actions = (
    <>
      <GameButton
        variant="secondary"
        onClick={() => drawCard()}
        disabled={!state || state.status !== 'playing' || state.stock.length === 0}
      >
        Draw
      </GameButton>
      <GameButton variant="primary" onClick={() => startPuzzle(puzzle.id)}>
        Restart
      </GameButton>
    </>
  );

  return (
    <GameShell backTo="/puzzles" backLabel="Puzzles" toolbar={toolbar} actions={actions}>
      {error && (
        <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="text-red-200 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-xs text-white/50">
        <span>★★★ ≤ {puzzle.starThresholds.three} moves</span>
        <span>★★ ≤ {puzzle.starThresholds.two} moves</span>
      </div>

      <div className="game-table-frame">
        <GameCanvas state={state} onCardClick={playCard} className="h-full w-full" />
      </div>

      {lastResult && (
        <PuzzleResultModal
          result={lastResult}
          title={puzzle.title}
          onRetry={() => startPuzzle(puzzle.id)}
          onBack={() => navigate('/puzzles')}
        />
      )}
    </GameShell>
  );
}
