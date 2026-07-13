export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

export type PuzzleStars = 0 | 1 | 2 | 3;

export interface PuzzleStarThresholds {
  /** Max moves (inclusive) for 3 stars. */
  three: number;
  /** Max moves (inclusive) for 2 stars. */
  two: number;
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: PuzzleDifficulty;
  seed: number;
  moveLimit: number;
  starThresholds: PuzzleStarThresholds;
}

export interface PuzzleProgress {
  puzzleId: string;
  bestStars: PuzzleStars;
  bestMoves: number | null;
  completedAt?: string;
}

export interface PuzzleResult {
  puzzleId: string;
  stars: PuzzleStars;
  movesUsed: number;
  moveLimit: number;
  won: boolean;
  isNewBest: boolean;
}
