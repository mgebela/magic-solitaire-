import { describe, expect, it } from 'vitest';
import { streaksFromDates } from '@three-towers/shared';

describe('daily streaks', () => {
  it('returns zeros when no days were played', () => {
    expect(streaksFromDates([], '2026-10-15')).toEqual({ current: 0, best: 0 });
  });

  it('counts today as a live streak of one', () => {
    expect(streaksFromDates(['2026-10-15'], '2026-10-15')).toEqual({ current: 1, best: 1 });
  });

  it('keeps yesterday’s streak alive until the day is missed', () => {
    expect(streaksFromDates(['2026-10-14'], '2026-10-15')).toEqual({ current: 1, best: 1 });
  });

  it('breaks the current streak after a missed day', () => {
    expect(streaksFromDates(['2026-10-13'], '2026-10-15')).toEqual({ current: 0, best: 1 });
  });

  it('tracks the longest run even after a gap', () => {
    expect(
      streaksFromDates(['2026-10-10', '2026-10-11', '2026-10-12', '2026-10-15'], '2026-10-15'),
    ).toEqual({ current: 1, best: 3 });
  });

  it('counts consecutive days ending today', () => {
    expect(
      streaksFromDates(['2026-10-13', '2026-10-14', '2026-10-15'], '2026-10-15'),
    ).toEqual({ current: 3, best: 3 });
  });
});
