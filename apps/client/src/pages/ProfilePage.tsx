import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import type { PlayerStatisticsResponse } from '@three-towers/shared';
import { GameHistoryList } from '../components/GameHistoryList';
import { ModeStatsTable } from '../components/ModeStatsTable';
import { StatsCard } from '../components/StatsCard';
import { AppBackground } from '../components/layout/AppBackground';
import { formatDuration, formatWinRate } from '../lib/format-time';
import { getPlayerStatistics } from '../lib/profile-api';
import { useAuthStore } from '../stores/authStore';

export default function ProfilePage() {
  const { user, tokens } = useAuthStore();
  const accessToken = tokens?.accessToken;

  const [stats, setStats] = useState<PlayerStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getPlayerStatistics(accessToken)
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load profile'),
      )
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AppBackground variant="lobby">
      <div className="lobby mx-auto max-w-4xl">
        <Link to="/" className="text-sm font-semibold text-[var(--color-gold)] hover:opacity-80">
          ← Lobby
        </Link>

        <header className="mt-4 mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--color-gold-light)]">
            {user.username}
          </h1>
          <p className="mt-1 text-white/60">{user.email}</p>
          <p className="mt-2 text-sm text-white/40">Member since {memberSince}</p>
        </header>

        {loading && <p className="text-center text-white/50">Loading statistics…</p>}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {stats && !loading && (
          <div className="space-y-8">
            <section className="lobby-panel">
              <h2 className="mb-4 text-lg font-semibold text-white">Overview</h2>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatsCard label="Games played" value={stats.totals.gamesPlayed} />
                <StatsCard label="Wins" value={stats.totals.wins} />
                <StatsCard
                  label="Win rate"
                  value={formatWinRate(stats.totals.winRate)}
                  subtext={`${stats.totals.losses} losses`}
                />
                <StatsCard
                  label="Time played"
                  value={formatDuration(stats.totals.totalElapsedMs)}
                />
              </dl>
            </section>

            <section className="lobby-panel">
              <h2 className="mb-4 text-lg font-semibold text-white">By mode</h2>
              <ModeStatsTable stats={stats.byMode} />
            </section>

            <section className="lobby-panel">
              <h2 className="mb-4 text-lg font-semibold text-white">Recent games</h2>
              <GameHistoryList games={stats.recentGames} />
            </section>
          </div>
        )}
      </div>
    </AppBackground>
  );
}
