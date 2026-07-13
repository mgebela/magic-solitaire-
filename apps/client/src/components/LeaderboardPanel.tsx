import { useEffect, useState } from 'react';
import type { LeaderboardEntry, SinglePlayerMode } from '@three-towers/shared';
import { formatElapsed } from '../lib/format-time';
import { getLeaderboard } from '../lib/leaderboard-api';

interface LeaderboardPanelProps {
  mode?: SinglePlayerMode;
}

export function LeaderboardPanel({ mode = 'timed' }: LeaderboardPanelProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getLeaderboard(mode)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <div className="rounded-xl bg-white/5 p-4">
      <h3 className="mb-4 text-lg font-semibold capitalize">{mode} Leaderboard</h3>

      {loading && <p className="text-sm text-white/50">Loading…</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <p className="text-sm text-white/50">No wins yet — be the first!</p>
      )}

      {entries.length > 0 && (
        <ol className="space-y-2">
          {entries.map((entry) => (
            <li
              key={`${entry.userId}-${entry.finishedAt}`}
              className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 font-mono text-white/40">#{entry.rank}</span>
                <span className="font-medium text-white">{entry.username}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-[var(--color-gold)]">{entry.score}</div>
                <div className="font-mono text-xs text-white/40">
                  {formatElapsed(entry.elapsedMs)}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
