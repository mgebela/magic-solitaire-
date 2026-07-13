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
    <Link to={`/puzzles/${puzzle.id}`} className="mode-tile block">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="mode-tile__title">{puzzle.title}</h3>
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
