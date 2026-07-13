import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getPuzzleById, movesRemaining } from '@three-towers/shared';
import { GameCanvas } from '../components/GameCanvas';
import { PuzzleResultModal } from '../components/PuzzleResultModal';
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
    <div className="magic-play-screen">
      {error && (
        <div className="magic-play-screen__error">
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            ✕
          </button>
        </div>
      )}

      <GameCanvas
        state={state}
        immersive
        roundLabel="Moves"
        roundCurrent={movesLeft}
        roundTotal={state?.moveLimit ?? puzzle.moveLimit}
        onCardClick={playCard}
        onDraw={() => drawCard()}
        className="magic-play-screen__canvas"
      />

      {lastResult && (
        <PuzzleResultModal
          result={lastResult}
          title={puzzle.title}
          onRetry={() => startPuzzle(puzzle.id)}
          onBack={() => navigate('/puzzles')}
        />
      )}
    </div>
  );
}
