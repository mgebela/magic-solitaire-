import { MAX_RANK, rankFromRelics, useCareerStore } from '../stores/careerStore';
import { RankSteps } from './RankSteps';

function daysLeft(startedAt: number, windowMs: number): string {
  const ms = startedAt + windowMs - Date.now();
  const days = Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  if (days === 0) return 'Last day';
  return days === 1 ? '1 day left' : `${days} days left`;
}

export function WeeklyGoals() {
  const goals = useCareerStore((s) => s.goals);
  const relics = useCareerStore((s) => s.relics);
  const rank = rankFromRelics(relics);

  return (
    <section className="goal-row" aria-label="Weekly challenges">
      <div className="goal-row__head">
        <h2>Challenges</h2>
        <p>
          Rank {rank} of {MAX_RANK}
          <span>· {relics} relics</span>
        </p>
      </div>
      <RankSteps rank={rank} />
      <div className="goal-row__grid">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100));
          return (
            <article key={goal.id} className={goal.earned ? 'goal-card is-earned' : 'goal-card'}>
              <header>
                <h3>{goal.title}</h3>
                <span>{goal.earned ? 'Badge earned' : daysLeft(goal.startedAt, goal.windowMs)}</span>
              </header>
              <p>{goal.earned ? goal.badge : goal.detail}</p>
              <div className="goal-card__track" aria-hidden>
                <div style={{ width: `${pct}%` }} />
              </div>
              <strong>
                {goal.progress.toLocaleString()} / {goal.target.toLocaleString()}
              </strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}
