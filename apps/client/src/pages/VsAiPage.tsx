import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { VsAiResult } from '@three-towers/shared';
import { GameCanvas } from '../components/GameCanvas';
import { AiDifficultySelect } from '../components/AiDifficultySelect';
import { AiOpponentPanel } from '../components/AiOpponentPanel';
import { GameTimer } from '../components/GameTimer';
import { VsAiResultModal } from '../components/VsAiResultModal';
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

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-felt-dark)]">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-[var(--color-gold)] hover:opacity-80">
          ← Three Towers
        </Link>

        {playerState && difficulty && (
          <div className="flex items-center gap-6 text-sm text-white/80">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-white/70">
              vs {difficulty} AI
            </span>
            <GameTimer
              elapsedMs={playerState.elapsedMs}
              mode="timed"
              running={playerState.status === 'playing'}
            />
            <span>
              Score: <strong className="text-white">{playerState.score}</strong>
            </span>
            <span>
              Combo: <strong className="text-[var(--color-gold)]">×{playerState.combo || 1}</strong>
            </span>
          </div>
        )}

        {playerState && (
          <div className="flex gap-2">
            <button
              onClick={() => drawCard()}
              disabled={playerState.status !== 'playing' || playerState.stock.length === 0}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Draw
            </button>
            <button
              onClick={() => difficulty && startGame(difficulty)}
              className="rounded-lg bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
            >
              New Game
            </button>
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

      <main className="relative flex flex-1 gap-4 p-4">
        {showSelect ? (
          <AiDifficultySelect onSelect={(d) => startGame(d)} />
        ) : (
          <>
            <aside className="hidden w-56 shrink-0 lg:block">
              {difficulty && <AiOpponentPanel difficulty={difficulty} state={aiState} />}
            </aside>

            <div className="flex flex-1 flex-col">
              {difficulty && (
                <div className="mb-4 lg:hidden">
                  <AiOpponentPanel difficulty={difficulty} state={aiState} />
                </div>
              )}

              <div className="flex-1 overflow-hidden rounded-2xl border border-white/10">
                <GameCanvas
                  state={playerState}
                  onCardClick={playCard}
                  className="h-[min(70vh,560px)] w-full"
                />
              </div>

              {playerState?.status === 'playing' && (
                <p className="mt-4 text-center text-sm text-white/40">
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
          </>
        )}
      </main>
    </div>
  );
}
