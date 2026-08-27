import { Link } from 'react-router-dom';
import { PUZZLE_CATALOG } from '@three-towers/shared';
import { AppBackground } from '../components/layout/AppBackground';
import { PuzzleCard } from '../components/PuzzleCard';
import { usePuzzleStore } from '../stores/puzzleStore';

export default function PuzzlesPage() {
  const getProgress = usePuzzleStore((s) => s.getProgress);
  const progress = usePuzzleStore((s) => s.progress);

  const totalStars = Object.values(progress).reduce((sum, entry) => sum + entry.bestStars, 0);
  const maxStars = PUZZLE_CATALOG.length * 3;

  return (
    <AppBackground variant="lobby">
      <div className="lobby mx-auto max-w-3xl">
        <Link to="/" className="page-back">
          ← Lobby
        </Link>

        <header className="mt-4 mb-8">
          <h1 className="page-title">Puzzle Towers</h1>
          <p className="page-subtitle">
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
    </AppBackground>
  );
}
