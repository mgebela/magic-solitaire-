import { Link } from 'react-router-dom';
import { PUZZLE_CATALOG, type PuzzleDifficulty } from '@three-towers/shared';
import { AppBackground } from '../components/layout/AppBackground';
import { PuzzleCard } from '../components/PuzzleCard';
import { usePuzzleStore } from '../stores/puzzleStore';

const GROUPS: Array<{ id: PuzzleDifficulty; label: string }> = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

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

        <header className="solid-copy mt-4 mb-8">
          <h1 className="page-title">Puzzle Towers</h1>
          <p className="page-subtitle">
            Curated layouts with move limits. Earn up to 3 stars per puzzle.
          </p>
          <p className="mt-3 text-sm text-white/75">
            Progress: {totalStars} / {maxStars} stars
          </p>
        </header>

        {GROUPS.map((group) => (
          <section key={group.id} className="puzzle-group" aria-labelledby={`puzzles-${group.id}`}>
            <h2 id={`puzzles-${group.id}`} className="puzzle-group__title">
              {group.label}
            </h2>
            <div className="grid gap-4">
              {PUZZLE_CATALOG.filter((puzzle) => puzzle.difficulty === group.id).map((puzzle) => (
                <PuzzleCard key={puzzle.id} puzzle={puzzle} progress={getProgress(puzzle.id)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppBackground>
  );
}
