import type { PuzzleStarThresholds, PuzzleStars } from '@three-towers/shared';

export function computePuzzleStars(
  movesUsed: number,
  thresholds: PuzzleStarThresholds,
  moveLimit: number,
  won: boolean,
): PuzzleStars {
  if (!won || movesUsed > moveLimit) return 0;
  if (movesUsed <= thresholds.three) return 3;
  if (movesUsed <= thresholds.two) return 2;
  return 1;
}

export function movesRemaining(moveLimit: number, movesUsed: number): number {
  return Math.max(0, moveLimit - movesUsed);
}
