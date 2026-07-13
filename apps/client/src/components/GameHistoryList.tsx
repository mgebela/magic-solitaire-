import type { GameSummary } from '@three-towers/shared';
import { formatElapsed, formatMode } from '../lib/format-time';

interface GameHistoryListProps {
  games: GameSummary[];
}

const STATUS_STYLES: Record<GameSummary['status'], string> = {
  won: 'text-green-400',
  lost: 'text-red-400',
  playing: 'text-yellow-400',
  idle: 'text-white/40',
};

export function GameHistoryList({ games }: GameHistoryListProps) {
  if (games.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/50">
        No games yet. Play solo or daily to build your history.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
      {games.map((game) => (
        <li
          key={game.id}
          className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.03] px-4 py-3 text-sm"
        >
          <div>
            <span className="font-medium capitalize text-white">{formatMode(game.mode)}</span>
            <span className={`ml-2 capitalize ${STATUS_STYLES[game.status]}`}>
              {game.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-white/60">
            <span>
              Score: <strong className="text-white">{game.score}</strong>
            </span>
            <span className="font-mono">{formatElapsed(game.elapsedMs)}</span>
            <span className="text-xs text-white/40">
              {new Date(game.startedAt).toLocaleDateString()}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
