import { MAX_RANK } from '../stores/careerStore';

export function RankSteps({ rank }: { rank: number }) {
  return (
    <div className="rank-steps" aria-hidden>
      {Array.from({ length: MAX_RANK }, (_, index) => (
        <span key={index} className={index < rank ? 'is-on' : undefined} />
      ))}
    </div>
  );
}
