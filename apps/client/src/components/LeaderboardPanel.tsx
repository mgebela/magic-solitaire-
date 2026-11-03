import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LeaderboardEntry, LeaderboardPeriod, TopScoresResponse } from '@three-towers/shared';
import { getTopScores } from '../lib/leaderboard-api';

const PERIODS: { id: LeaderboardPeriod; label: string; standing: string }[] = [
  { id: 'today', label: 'Today', standing: 'today' },
  { id: 'week', label: 'This week', standing: 'this week' },
  { id: 'month', label: 'This month', standing: 'this month' },
];

interface LeaderboardPanelProps {
  accessToken?: string;
  userId?: string;
}

function formatScore(score: number): string {
  return score.toLocaleString('en-US');
}

function scoreErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : 'Failed to load scores';
  if (/request failed|offline|unreachable|invalid response/i.test(message)) {
    return 'Scores are offline right now.';
  }
  return message;
}

export function LeaderboardPanel({ accessToken, userId }: LeaderboardPanelProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>('today');
  const [data, setData] = useState<TopScoresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTopScores(period, accessToken)
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(scoreErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, accessToken]);

  const standing = PERIODS.find((item) => item.id === period)?.standing ?? 'today';
  const board = data?.period === period ? data : null;
  const you = board?.you ?? null;
  const entries = board?.entries ?? [];

  const standingLine = loading && !board ? (
    <p className="scoreboard__stand">Checking scores…</p>
  ) : you ? (
    <p className="scoreboard__stand">
      You are <strong>#{you.rank}</strong> {standing}
      <span> · {formatScore(you.score)}</span>
    </p>
  ) : error ? (
    <p className="scoreboard__stand">Your rank will show once scores are back.</p>
  ) : userId ? (
    <p className="scoreboard__stand">Play a cleared game to get on the board.</p>
  ) : (
    <p className="scoreboard__stand">
      <Link to="/login">Sign in</Link> to see where you stand.
    </p>
  );

  const showYouBelow =
    you != null && !entries.some((entry) => entry.userId === you.userId);

  return (
    <section className="scoreboard" aria-label="Top scores" aria-busy={loading}>
      <div className="scoreboard__head">
        <h2>Top scores</h2>
        {standingLine}
      </div>

      <div className="scoreboard__tabs" role="tablist" aria-label="Score period">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={period === item.id}
            onClick={() => setPeriod(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="scoreboard__panel">
        <div className="scoreboard__cols" aria-hidden="true">
          <span>Rank</span>
          <span>Name</span>
          <span>Score</span>
        </div>
        {error ? (
          <p className="scoreboard__empty">{error}</p>
        ) : loading && entries.length === 0 ? (
          <p className="scoreboard__empty">Loading scores…</p>
        ) : entries.length === 0 ? (
          <p className="scoreboard__empty">No scores yet {standing}.</p>
        ) : (
          <ol className="scoreboard__list">
            {entries.map((entry) => (
              <ScoreRow key={entry.userId} entry={entry} yours={entry.userId === userId} />
            ))}
            {showYouBelow && you && <ScoreRow entry={you} yours />}
          </ol>
        )}
      </div>
    </section>
  );
}

function ScoreRow({ entry, yours }: { entry: LeaderboardEntry; yours: boolean }) {
  return (
    <li className={yours ? 'is-you' : undefined}>
      <span className="scoreboard__rank">{entry.rank}</span>
      <span className="scoreboard__name">{entry.username}</span>
      <span className="scoreboard__score">{formatScore(entry.score)}</span>
    </li>
  );
}
