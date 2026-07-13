import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { GameCanvas } from '../components/GameCanvas';
import { DailyLeaderboardPanel } from '../components/DailyLeaderboardPanel';
import { GameTimer } from '../components/GameTimer';
import { GameShell } from '../components/layout/GameShell';
import { GameButton } from '../components/ui/GameButton';
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

  const toolbar =
    state && isPlaying ? (
      <>
        <span className="mode-badge">Daily</span>
        {challenge && <span className="stat-pill text-white/50">{challenge.date}</span>}
        <GameTimer elapsedMs={state.elapsedMs} mode="daily" running />
        <span className="stat-pill">
          Score <strong>{state.score}</strong>
        </span>
        <span className="stat-pill stat-pill--gold">
          Combo <strong>×{state.combo || 1}</strong>
        </span>
        {isSyncing && <span className="text-xs text-white/40">Saving…</span>}
      </>
    ) : challenge ? (
      <>
        <span className="mode-badge">Daily Challenge</span>
        <span className="stat-pill text-white/50">{challenge.date}</span>
      </>
    ) : null;

  const actions =
    isPlaying ? (
      <GameButton
        variant="secondary"
        onClick={() => accessToken && drawCard(accessToken)}
        disabled={!state || state.stock.length === 0}
      >
        Draw
      </GameButton>
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

      <div className="flex flex-1 gap-4">
        <div className="flex flex-1 flex-col">
          {isLoading && !state && (
            <div className="flex flex-1 items-center justify-center text-white/50">
              Loading today&apos;s challenge…
            </div>
          )}

          {!isLoading && !state && !hasFinishedAttempt && challenge?.canPlay && (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12">
              <div className="lobby-panel max-w-md text-center">
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-gold-light)]">
                  Today&apos;s Challenge
                </h2>
                <p className="mt-3 text-white/60">
                  Everyone plays the same board. One shot — make it count.
                </p>
                <GameButton
                  variant="primary"
                  className="mt-8 px-10 py-3 text-lg"
                  onClick={() => accessToken && startChallenge(accessToken)}
                >
                  Start Challenge
                </GameButton>
              </div>
            </div>
          )}

          {hasFinishedAttempt && !isPlaying && !state && challenge?.attempt && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="lobby-panel max-w-md">
                <div className="font-[family-name:var(--font-display)] text-2xl text-white">
                  Already played today
                </div>
                <p className="mt-3 text-white/60">
                  Your score:{' '}
                  <strong className="text-[var(--color-gold)]">{challenge.attempt.score}</strong>
                  {' · '}
                  {formatElapsed(challenge.attempt.elapsedMs)}
                </p>
                <p className="mt-4 text-sm text-white/40">Come back tomorrow for a new challenge.</p>
              </div>
            </div>
          )}

          {state && (
            <div className="game-table-frame">
              <GameCanvas
                state={state}
                onCardClick={(cardId) => accessToken && playCard(cardId, accessToken)}
                className="h-full w-full"
              />
            </div>
          )}

          {justFinished && stats && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="lobby-panel w-full max-w-md p-8 text-center shadow-2xl">
                <div
                  className={`font-[family-name:var(--font-display)] text-4xl ${
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
      </div>

      <div className="mt-4 lg:hidden">
        <DailyLeaderboardPanel leaderboard={leaderboard} currentUserId={user.id} />
      </div>
    </GameShell>
  );
}
