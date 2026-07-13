import type { PuzzleDefinition } from '../types/puzzle';

/** Curated puzzle layouts — each uses a fixed seed for a reproducible deal. */
export const PUZZLE_CATALOG: PuzzleDefinition[] = [
  {
    id: 'warm-up',
    title: 'Warm Up',
    description: 'A gentle introduction to move-limited play.',
    difficulty: 'easy',
    seed: 583_920_174,
    moveLimit: 36,
    starThresholds: { three: 20, two: 28 },
  },
  {
    id: 'sunny-peaks',
    title: 'Sunny Peaks',
    description: 'Clear the towers before you run out of moves.',
    difficulty: 'easy',
    seed: 42,
    moveLimit: 34,
    starThresholds: { three: 19, two: 26 },
  },
  {
    id: 'tightrope',
    title: 'Tightrope',
    description: 'Every draw counts — plan your route carefully.',
    difficulty: 'medium',
    seed: 123_456_789,
    moveLimit: 30,
    starThresholds: { three: 17, two: 23 },
  },
  {
    id: 'combo-cascade',
    title: 'Combo Cascade',
    description: 'Chain plays to conserve your move budget.',
    difficulty: 'medium',
    seed: 999,
    moveLimit: 28,
    starThresholds: { three: 16, two: 22 },
  },
  {
    id: 'narrow-path',
    title: 'Narrow Path',
    description: 'Few moves, many cards — find the optimal line.',
    difficulty: 'medium',
    seed: 314_159_265,
    moveLimit: 26,
    starThresholds: { three: 15, two: 20 },
  },
  {
    id: 'kings-gambit',
    title: "King's Gambit",
    description: 'A tricky stock — use it wisely.',
    difficulty: 'hard',
    seed: 777_777,
    moveLimit: 24,
    starThresholds: { three: 14, two: 18 },
  },
  {
    id: 'triple-crown',
    title: 'Triple Crown',
    description: 'Expert routing required for three stars.',
    difficulty: 'hard',
    seed: 1_618_033,
    moveLimit: 22,
    starThresholds: { three: 13, two: 17 },
  },
  {
    id: 'final-ascent',
    title: 'Final Ascent',
    description: 'The ultimate move-limit challenge.',
    difficulty: 'hard',
    seed: 2_718_281,
    moveLimit: 20,
    starThresholds: { three: 12, two: 16 },
  },
];

export function getPuzzleById(id: string): PuzzleDefinition | undefined {
  return PUZZLE_CATALOG.find((puzzle) => puzzle.id === id);
}
