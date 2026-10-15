import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { GameCanvas } from '../components/GameCanvas';
import { DailyLeaderboardPanel } from '../components/DailyLeaderboardPanel';
import { AppBackground } from '../components/layout/AppBackground';
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
  const justFinished = Boolean(state && !isPlaying && challenge?.canPlay === false);
  const stats = state ? computeGameStats(state) : null;
  const streak = challenge?.streak;
  const displayStreak =
    streak && justFinished
      ? {
          current: streak.current + 1,
          best: Math.max(streak.best, streak.current + 1),
        }
      : streak;
  const streakLabel = displayStreak
    ? `Streak ${displayStreak.current} · Best ${displayStreak.best}`
    : null;

  const errorBanner = error ? (
    <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
      <span>{error}</span>
      <button type="button" onClick={clearError} className="text-red-200 hover:text-white">
        ✕
      </button>
    </div>
  ) : null;

  if (!state) {
    return (
      <AppBackground variant="lobby">
        <div className="lobby">
          <Link to="/" className="page-back">
            ← Lobby
          </Link>
          {errorBanner}

          {isLoading && (
            <div className="flex flex-1 items-center justify-center py-24 text-white/50">
              Loading today&apos;s challenge…
            </div>
          )}

          {!isLoading && !hasFinishedAttempt && challenge?.canPlay && (
            <div className="flex flex-col items-center justify-center gap-6 py-12">
              <div className="lobby-panel max-w-md text-center">
                <h2 className="page-title !text-3xl">Today's Challenge</h2>
                <p className="page-subtitle">
                  Everyone plays the same board. One shot — make it count.
                </p>
                {streakLabel && <p className="mt-3 text-sm text-[var(--color-neon)]">{streakLabel}</p>}
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

          {hasFinishedAttempt && challenge?.attempt && (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
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
                {streakLabel && <p className="mt-3 text-sm text-[var(--color-neon)]">{streakLabel}</p>}
                <p className="mt-4 text-sm text-white/40">Come back tomorrow for a new challenge.</p>
              </div>
            </div>
          )}

          <div className="mt-8 max-w-md mx-auto">
            <DailyLeaderboardPanel leaderboard={leaderboard} currentUserId={user.id} />
          </div>
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

      {isSyncing && <div className="magic-play-screen__saving">Saving…</div>}

      <GameCanvas
        state={state}
        immersive
        roundLabel="Daily"
        roundValue={challenge?.date}
        onCardClick={(cardId) => accessToken && playCard(cardId, accessToken)}
        onDraw={() => accessToken && drawCard(accessToken)}
        className="magic-play-screen__canvas"
      />

      {leaderboard && leaderboard.entries.length > 0 && (
        <aside className="play-rivals" aria-label="Daily leaderboard">
          <p className="play-rivals__title">Leaders</p>
          <ul>
            {leaderboard.entries.slice(0, 5).map((entry) => (
              <li key={`${entry.userId}-${entry.finishedAt}`}>
                <span className={entry.userId === user.id ? 'text-[var(--color-gold)]' : undefined}>
                  {entry.username}
                </span>
                <span>{entry.score}</span>
              </li>
            ))}
          </ul>
        </aside>
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
            {streakLabel && <p className="mt-2 text-sm text-[var(--color-neon)]">{streakLabel}</p>}
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
            <p className="mt-4 text-sm text-white/40">Come back tomorrow for a new challenge.</p>
            <Link to="/" className="game-btn game-btn--primary mt-6 block w-full py-3 text-center">
              Back to Lobby
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
