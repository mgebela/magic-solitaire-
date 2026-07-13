import { Link } from 'react-router-dom';
import type { PuzzleDefinition, PuzzleProgress } from '@three-towers/shared';
import { StarRating } from './StarRating';

interface PuzzleCardProps {
  puzzle: PuzzleDefinition;
  progress: PuzzleProgress | null;
}

const DIFFICULTY_COLORS: Record<PuzzleDefinition['difficulty'], string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
};

export function PuzzleCard({ puzzle, progress }: PuzzleCardProps) {
  return (
    <Link
      to={`/puzzles/${puzzle.id}`}
      className="block rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-[var(--color-gold)]/40 hover:bg-white/10"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{puzzle.title}</h3>
          <p className={`mt-1 text-xs font-medium uppercase ${DIFFICULTY_COLORS[puzzle.difficulty]}`}>
            {puzzle.difficulty}
          </p>
        </div>
        <StarRating stars={progress?.bestStars ?? 0} size="sm" />
      </div>

      <p className="mb-4 text-sm leading-relaxed text-white/60">{puzzle.description}</p>

      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{puzzle.moveLimit} moves max</span>
        <span>
          ★★★ ≤{puzzle.starThresholds.three} · ★★ ≤{puzzle.starThresholds.two}
        </span>
      </div>
    </Link>
  );
}
