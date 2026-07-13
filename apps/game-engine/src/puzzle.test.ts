import { describe, expect, it } from 'vitest';
import { computePuzzleStars, movesRemaining } from './puzzle';

describe('puzzle', () => {
  const thresholds = { three: 15, two: 20 };

  it('awards 3 stars for efficient wins', () => {
    expect(computePuzzleStars(14, thresholds, 25, true)).toBe(3);
  });

  it('awards 2 stars for moderate wins', () => {
    expect(computePuzzleStars(18, thresholds, 25, true)).toBe(2);
  });

  it('awards 1 star for a win within the move limit', () => {
    expect(computePuzzleStars(24, thresholds, 25, true)).toBe(1);
  });

  it('awards 0 stars on a loss', () => {
    expect(computePuzzleStars(10, thresholds, 25, false)).toBe(0);
  });

  it('tracks remaining moves', () => {
    expect(movesRemaining(25, 10)).toBe(15);
    expect(movesRemaining(25, 30)).toBe(0);
  });
});
