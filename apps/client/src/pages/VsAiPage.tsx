import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { VsAiResult } from '@three-towers/shared';
import { GameCanvas } from '../components/GameCanvas';
import { AiDifficultySelect } from '../components/AiDifficultySelect';
import { VsAiResultModal } from '../components/VsAiResultModal';
import { AppBackground } from '../components/layout/AppBackground';
import { useAiGameStore } from '../stores/aiGameStore';

export default function VsAiPage() {
  const {
    playerState,
    aiState,
    difficulty,
    error,
    startGame,
    playCard,
    drawCard,
    tickPlayerTimer,
    reset,
    stopAi,
    clearError,
  } = useAiGameStore();

  useEffect(() => {
    if (!playerState || playerState.status !== 'playing') return;

    const interval = window.setInterval(() => tickPlayerTimer(), 50);
    return () => window.clearInterval(interval);
  }, [playerState?.status, tickPlayerTimer]);

  useEffect(() => () => stopAi(), [stopAi]);

  const showSelect = !playerState && !difficulty;
  const matchOver =
    playerState &&
    aiState &&
    playerState.status !== 'playing' &&
    aiState.status !== 'playing';

  const result: VsAiResult | null =
    matchOver && playerState && aiState && difficulty
      ? {
          playerWon: playerState.status === 'won',
          aiWon: aiState.status === 'won',
          playerScore: playerState.score,
          aiScore: aiState.score,
          playerElapsedMs: playerState.elapsedMs,
          aiElapsedMs: aiState.elapsedMs,
          difficulty,
        }
      : null;

  if (showSelect) {
    return (
      <AppBackground variant="lobby">
        <div className="lobby">
          <Link to="/" className="text-sm font-semibold text-[var(--color-gold)] hover:opacity-80">
            ← Lobby
          </Link>
          <AiDifficultySelect onSelect={(d) => startGame(d)} />
        </div>
      </AppBackground>
    );
  }

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
        state={playerState}
        immersive
        roundCurrent={1}
        roundTotal={10}
        roundLabel="Round"
        onCardClick={playCard}
        onDraw={() => drawCard()}
        className="magic-play-screen__canvas"
      />

      {result && (
        <VsAiResultModal
          result={result}
          onPlayAgain={() => difficulty && startGame(difficulty)}
          onChangeDifficulty={() => reset()}
        />
      )}
    </div>
  );
}
