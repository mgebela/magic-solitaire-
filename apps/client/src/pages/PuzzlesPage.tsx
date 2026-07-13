import { Link } from 'react-router-dom';
import { PUZZLE_CATALOG } from '@three-towers/shared';
import { PuzzleCard } from '../components/PuzzleCard';
import { usePuzzleStore } from '../stores/puzzleStore';

export default function PuzzlesPage() {
  const getProgress = usePuzzleStore((s) => s.getProgress);
  const progress = usePuzzleStore((s) => s.progress);

  const totalStars = Object.values(progress).reduce((sum, entry) => sum + entry.bestStars, 0);
  const maxStars = PUZZLE_CATALOG.length * 3;

  return (
    <div className="min-h-screen bg-[var(--color-felt-dark)] p-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-[var(--color-gold)] hover:opacity-80">
          ← Home
        </Link>

        <header className="mt-4 mb-8">
          <h1 className="text-4xl font-bold text-white">Puzzle Mode</h1>
          <p className="mt-2 text-white/60">
            Curated layouts with move limits. Earn up to 3 stars per puzzle.
          </p>
          <p className="mt-3 text-sm text-white/40">
            Progress: {totalStars} / {maxStars} stars
          </p>
        </header>

        <div className="grid gap-4">
          {PUZZLE_CATALOG.map((puzzle) => (
            <PuzzleCard key={puzzle.id} puzzle={puzzle} progress={getProgress(puzzle.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
