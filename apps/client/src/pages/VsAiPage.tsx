import { useEffect } from 'react';
import type { VsAiResult } from '@three-towers/shared';
import { GameCanvas } from '../components/GameCanvas';
import { AiDifficultySelect } from '../components/AiDifficultySelect';
import { AiOpponentPanel } from '../components/AiOpponentPanel';
import { GameTimer } from '../components/GameTimer';
import { VsAiResultModal } from '../components/VsAiResultModal';
import { GameShell } from '../components/layout/GameShell';
import { GameButton } from '../components/ui/GameButton';
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

  const toolbar =
    playerState && difficulty ? (
      <>
        <span className="mode-badge">vs {difficulty} AI</span>
        <GameTimer
          elapsedMs={playerState.elapsedMs}
          mode="timed"
          running={playerState.status === 'playing'}
        />
        <span className="stat-pill">
          Score <strong>{playerState.score}</strong>
        </span>
        <span className="stat-pill stat-pill--gold">
          Combo <strong>×{playerState.combo || 1}</strong>
        </span>
      </>
    ) : null;

  const actions =
    playerState ? (
      <>
        <GameButton
          variant="secondary"
          onClick={() => drawCard()}
          disabled={playerState.status !== 'playing' || playerState.stock.length === 0}
        >
          Draw
        </GameButton>
        <GameButton variant="primary" onClick={() => difficulty && startGame(difficulty)}>
          New Game
        </GameButton>
      </>
    ) : null;

  return (
    <GameShell toolbar={toolbar} actions={actions}>
      {error && (
        <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="text-red-200 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {showSelect ? (
        <AiDifficultySelect onSelect={(d) => startGame(d)} />
      ) : (
        <div className="flex flex-1 gap-4">
          <aside className="hidden w-56 shrink-0 lg:block">
            {difficulty && <AiOpponentPanel difficulty={difficulty} state={aiState} />}
          </aside>

          <div className="flex flex-1 flex-col">
            {difficulty && (
              <div className="mb-4 lg:hidden">
                <AiOpponentPanel difficulty={difficulty} state={aiState} />
              </div>
            )}

            <div className="game-table-frame">
              <GameCanvas state={playerState} onCardClick={playCard} className="h-full w-full" />
            </div>

            {playerState?.status === 'playing' && (
              <p className="hint-banner mt-4">
                Race the AI on the same deal — highest score wins.
              </p>
            )}
          </div>

          {result && (
            <VsAiResultModal
              result={result}
              onPlayAgain={() => difficulty && startGame(difficulty)}
              onChangeDifficulty={() => reset()}
            />
          )}
        </div>
      )}
    </GameShell>
  );
}
