import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { GameCanvas } from '../components/GameCanvas';
import { DailyLeaderboardPanel } from '../components/DailyLeaderboardPanel';
import { GameTimer } from '../components/GameTimer';
import { formatElapsed } from '../lib/format-time';
import { computeGameStats } from '../lib/game-stats';
import { useAuthStore } from '../stores/authStore';
import { useDailyStore } from '../stores/dailyStore';

export default function DailyPage() {
  const { tokens, user } = useAuthStore();
  const accessToken = tokens?.accessToken;

  const {
    challenge,
    leaderboard,
    state,
    isLoading,
    isSyncing,
    error,
    loadChallenge,
    loadLeaderboard,
    startChallenge,
    playCard,
    drawCard,
    tickTimer,
    clearError,
  } = useDailyStore();

  useEffect(() => {
    if (accessToken) {
      loadChallenge(accessToken);
      loadLeaderboard();
    }
  }, [accessToken, loadChallenge, loadLeaderboard]);

  useEffect(() => {
    if (!state || state.status !== 'playing') return;
    const interval = window.setInterval(() => tickTimer(), 50);
    return () => window.clearInterval(interval);
  }, [state?.status, tickTimer]);

  if (!tokens || !user) {
    return <Navigate to="/login" replace />;
  }

  const hasFinishedAttempt = challenge?.attempt && challenge.attempt.status !== 'playing';
  const isPlaying = state?.status === 'playing';
  const justFinished = state && !isPlaying && challenge?.canPlay === false;
  const stats = state ? computeGameStats(state) : null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-felt-dark)]">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-[var(--color-gold)] hover:opacity-80">
          ← Three Towers
        </Link>

        {challenge && (
          <div className="text-center">
            <div className="text-sm font-semibold text-white">Daily Challenge</div>
            <div className="text-xs text-white/50">{challenge.date} · One attempt per day</div>
          </div>
        )}

        {state && isPlaying && (
          <div className="flex items-center gap-6 text-sm text-white/80">
            <GameTimer elapsedMs={state.elapsedMs} mode="daily" running />
            <span>
              Score: <strong className="text-white">{state.score}</strong>
            </span>
            <span>
              Combo: <strong className="text-[var(--color-gold)]">×{state.combo || 1}</strong>
            </span>
            {isSyncing && <span className="text-xs text-white/40">Saving…</span>}
          </div>
        )}

        {isPlaying && (
          <div className="flex gap-2">
            <button
              onClick={() => accessToken && drawCard(accessToken)}
              disabled={!state || state.stock.length === 0}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Draw
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
        <div className="flex flex-1 flex-col">
          {isLoading && !state && (
            <div className="flex flex-1 items-center justify-center text-white/50">
              Loading today's challenge…
            </div>
          )}

          {!isLoading && !state && !hasFinishedAttempt && challenge?.canPlay && (
            <div className="flex flex-1 flex-col items-center justify-center gap-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-[var(--color-gold)]">Today's Challenge</h2>
                <p className="mt-2 text-white/60">
                  Everyone plays the same board. One shot — make it count.
                </p>
              </div>
              <button
                type="button"
                onClick={() => accessToken && startChallenge(accessToken)}
                className="rounded-xl bg-[var(--color-gold)] px-10 py-4 text-lg font-semibold text-black hover:brightness-110"
              >
                Start Challenge
              </button>
            </div>
          )}

          {hasFinishedAttempt && !isPlaying && !state && challenge?.attempt && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <div className="text-2xl font-bold text-white">Already played today</div>
              <p className="text-white/60">
                Your score:{' '}
                <strong className="text-[var(--color-gold)]">{challenge.attempt.score}</strong>
                {' · '}
                {formatElapsed(challenge.attempt.elapsedMs)}
              </p>
              <p className="text-sm text-white/40">Come back tomorrow for a new challenge.</p>
            </div>
          )}

          {state && (
            <div className="flex-1 overflow-hidden rounded-2xl border border-white/10">
              <GameCanvas
                state={state}
                onCardClick={(cardId) => accessToken && playCard(cardId, accessToken)}
                className="h-[min(70vh,560px)] w-full"
              />
            </div>
          )}

          {justFinished && stats && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--color-felt-dark)] p-8 text-center shadow-2xl">
                <div
                  className={`text-4xl font-bold ${
                    stats.status === 'won' ? 'text-[var(--color-gold)]' : 'text-red-400'
                  }`}
                >
                  {stats.status === 'won' ? 'Challenge Complete!' : 'Game Over'}
                </div>
                <p className="mt-2 text-sm text-white/60">Daily challenge · {challenge?.date}</p>
                <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-white/5 p-4 text-sm">
                  <div>
                    <dt className="text-white/50">Score</dt>
                    <dd className="text-2xl font-bold text-[var(--color-gold)]">{stats.score}</dd>
                  </div>
                  <div>
                    <dt className="text-white/50">Time</dt>
                    <dd className="font-mono text-2xl font-bold text-white">
                      {formatElapsed(stats.elapsedMs)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm text-white/40">
                  Come back tomorrow for a new challenge.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="hidden w-72 shrink-0 lg:block">
          <DailyLeaderboardPanel leaderboard={leaderboard} currentUserId={user.id} />
        </aside>
      </main>

      <div className="border-t border-white/10 p-4 lg:hidden">
        <DailyLeaderboardPanel leaderboard={leaderboard} currentUserId={user.id} />
      </div>
    </div>
  );
}
