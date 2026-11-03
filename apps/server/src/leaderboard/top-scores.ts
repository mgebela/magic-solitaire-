import type { LeaderboardPeriod } from '@three-towers/shared';

export interface RawScore {
  userId: string;
  username: string;
  score: number;
  elapsedMs: number;
  finishedAt: string;
}

/** Start of the leaderboard window in UTC. Weeks begin on Monday. */
export function periodStart(period: LeaderboardPeriod, now = new Date()): Date {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (period === 'today') return start;
  if (period === 'month') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start;
}

/** One row per player: highest score, then the faster clear. */
export function bestScoresByPlayer(games: RawScore[]): RawScore[] {
  const best = new Map<string, RawScore>();
  for (const game of games) {
    const current = best.get(game.userId);
    if (
      !current ||
      game.score > current.score ||
      (game.score === current.score && game.elapsedMs < current.elapsedMs)
    ) {
      best.set(game.userId, game);
    }
  }

  return [...best.values()].sort(
    (a, b) => b.score - a.score || a.elapsedMs - b.elapsedMs || a.username.localeCompare(b.username),
  );
}
