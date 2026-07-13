import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GameCanvas } from '../components/GameCanvas';
import { GameResultModal } from '../components/GameResultModal';
import { GameTimer } from '../components/GameTimer';
import { ModeSelect } from '../components/ModeSelect';
import { computeGameStats } from '../lib/game-stats';
import { formatMode } from '../lib/format-time';
import { getPersonalBest } from '../lib/leaderboard-api';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';

export default function PlayPage() {
  const { tokens } = useAuthStore();
  const accessToken = tokens?.accessToken;
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isPersonalBest, setIsPersonalBest] = useState(false);

  const {
    state,
    mode,
    persisted,
    allowUndo,
    isStarting,
    isSyncing,
    error,
    hintCardId,
    hintDraw,
    startGame,
    playCard,
    drawCard,
    undoMove,
    requestHint,
    clearHint,
    tickTimer,
    resetToModeSelect,
    clearError,
  } = useGameStore();

  useEffect(() => {
    if (!state || state.status !== 'playing') return;

    const interval = window.setInterval(() => tickTimer(), 50);
    return () => window.clearInterval(interval);
  }, [state?.status, tickTimer]);

  useEffect(() => {
    if (!accessToken || !mode) {
      setPersonalBest(null);
      return;
    }

    getPersonalBest(accessToken, mode)
      .then((result) => setPersonalBest(result.bestScore))
      .catch(() => setPersonalBest(null));
  }, [accessToken, mode]);

  useEffect(() => {
    if (!state || state.status !== 'won' || !accessToken || !mode) {
      setIsPersonalBest(false);
      return;
    }

    getPersonalBest(accessToken, mode)
      .then((result) => setIsPersonalBest(result.bestScore === state.score))
      .catch(() => setIsPersonalBest(false));
  }, [state?.status, state?.score, accessToken, mode]);

  const showModeSelect = !state && !isStarting;
  const showResult = state && (state.status === 'won' || state.status === 'lost');
  const stats = state
    ? computeGameStats(state, { isPersonalBest: isPersonalBest && state.status === 'won' })
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-felt-dark)]">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-[var(--color-gold)] hover:opacity-80">
          ← Three Towers
        </Link>

        {state && mode && (
          <div className="flex items-center gap-6 text-sm text-white/80">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/70">
              {formatMode(mode)}
            </span>
            <GameTimer
              elapsedMs={state.elapsedMs}
              mode={mode}
              running={state.status === 'playing'}
            />
            <span>
              Score: <strong className="text-white">{state.score}</strong>
            </span>
            <span>
              Combo: <strong className="text-[var(--color-gold)]">×{state.combo || 1}</strong>
            </span>
            <span>
              Stock: <strong className="text-white">{state.stock.length}</strong>
            </span>
            {personalBest !== null && (
              <span className="text-white/50">
                Best: <strong className="text-white/80">{personalBest}</strong>
              </span>
            )}
            {isSyncing && <span className="text-xs text-white/40">Saving…</span>}
          </div>
        )}

        {state && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => requestHint()}
              disabled={state.status !== 'playing'}
              className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hint
            </button>
            {allowUndo && (
              <button
                type="button"
                onClick={() => undoMove()}
                disabled={state.status !== 'playing'}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Undo
              </button>
            )}
            <button
              onClick={() => drawCard(accessToken)}
              disabled={state.status !== 'playing' || state.stock.length === 0}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 ${
                hintDraw ? 'bg-cyan-400/20 ring-2 ring-cyan-400/60' : 'bg-white/10'
              }`}
            >
              Draw
            </button>
            <button
              onClick={() => mode && startGame(mode, accessToken)}
              disabled={isStarting}
              className="rounded-lg bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
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

      <main className="relative flex-1 p-4">
        {showModeSelect ? (
          <ModeSelect
            isLoading={isStarting}
            onSelect={(selectedMode) => startGame(selectedMode, accessToken)}
          />
        ) : (
          <>
            <div className="mx-auto h-[min(70vh,560px)] max-w-5xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <GameCanvas
                state={state}
                onCardClick={(cardId) => {
                  clearHint();
                  playCard(cardId, accessToken);
                }}
                hintCardId={hintCardId}
                className="h-full w-full"
              />
            </div>

            {state?.status === 'playing' && (
              <p className="mt-4 text-center text-sm text-white/40">
                Click highlighted cards to play. Draw when no moves are available.
                {hintDraw && (
                  <span className="block text-cyan-300/80">Hint: draw from the stock pile.</span>
                )}
                {!accessToken && ' Sign in to save your games (undo disabled when signed in).'}
              </p>
            )}

            {showResult && stats && (
              <GameResultModal
                stats={stats}
                persisted={persisted}
                onPlayAgain={() => mode && startGame(mode, accessToken)}
                onChangeMode={resetToModeSelect}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
