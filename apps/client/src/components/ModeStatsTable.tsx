import type { ModeStatistics } from '@three-towers/shared';
import { formatElapsed, formatMode } from '../lib/format-time';

interface ModeStatsTableProps {
  stats: ModeStatistics[];
}

export function ModeStatsTable({ stats }: ModeStatsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
            <th className="px-4 py-3">Mode</th>
            <th className="px-4 py-3">Played</th>
            <th className="px-4 py-3">Wins</th>
            <th className="px-4 py-3">Win rate</th>
            <th className="px-4 py-3">Best score</th>
            <th className="px-4 py-3">Best time</th>
            <th className="px-4 py-3">Avg score</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((row) => {
            const winRate =
              row.gamesPlayed > 0 ? `${Math.round((row.wins / row.gamesPlayed) * 100)}%` : '—';

            return (
              <tr key={row.mode} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 font-medium capitalize text-[var(--color-gold)]">
                  {formatMode(row.mode)}
                </td>
                <td className="px-4 py-3 text-white/80">{row.gamesPlayed}</td>
                <td className="px-4 py-3 text-white/80">{row.wins}</td>
                <td className="px-4 py-3 text-white/80">{winRate}</td>
                <td className="px-4 py-3 font-mono text-white/80">
                  {row.bestScore ?? '—'}
                </td>
                <td className="px-4 py-3 font-mono text-white/80">
                  {row.bestElapsedMs !== null ? formatElapsed(row.bestElapsedMs) : '—'}
                </td>
                <td className="px-4 py-3 font-mono text-white/80">
                  {row.averageScore ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
