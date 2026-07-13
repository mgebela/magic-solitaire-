import type { DailyLeaderboardResponse } from '@three-towers/shared';
import { formatElapsed } from '../lib/format-time';

interface DailyLeaderboardPanelProps {
  leaderboard: DailyLeaderboardResponse | null;
  currentUserId?: string;
}

export function DailyLeaderboardPanel({ leaderboard, currentUserId }: DailyLeaderboardPanelProps) {
  if (!leaderboard) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
          Daily Leaderboard
        </h3>
        <p className="text-sm text-white/40">Loading…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-white/50">
        Daily Leaderboard
      </h3>
      <p className="mb-4 text-xs text-white/40">{leaderboard.date} (UTC)</p>

      {leaderboard.entries.length === 0 ? (
        <p className="text-sm text-white/50">No scores yet — be the first!</p>
      ) : (
        <ol className="space-y-2">
          {leaderboard.entries.map((entry) => (
            <li
              key={`${entry.userId}-${entry.finishedAt}`}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                entry.userId === currentUserId ? 'bg-[var(--color-gold)]/10' : 'bg-white/5'
              }`}
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
