import { describe, expect, it } from 'vitest';
import { getDailyChallengeDate, getDailySeed } from '@three-towers/shared';
import { GameEngine } from './game-engine';

describe('daily seed', () => {
  it('produces the same seed for the same UTC date', () => {
    const date = new Date('2026-07-13T15:30:00.000Z');
    expect(getDailySeed(date)).toBe(getDailySeed(new Date('2026-07-13T08:00:00.000Z')));
  });

  it('produces different seeds for different dates', () => {
    const a = getDailySeed(new Date('2026-07-13T12:00:00.000Z'));
    const b = getDailySeed(new Date('2026-07-14T12:00:00.000Z'));
    expect(a).not.toBe(b);
  });

  it('formats challenge date as YYYY-MM-DD UTC', () => {
    expect(getDailyChallengeDate(new Date('2026-07-13T23:59:00.000Z'))).toBe('2026-07-13');
  });

  it('generates identical layouts for the same daily seed', () => {
    const date = new Date('2026-07-13T12:00:00.000Z');
    const seed = getDailySeed(date);

    const a = new GameEngine({ mode: 'daily', allowUndo: false, seed }).init();
    const b = new GameEngine({ mode: 'daily', allowUndo: false, seed }).init();

    expect(a.tableau.map((c) => c?.id)).toEqual(b.tableau.map((c) => c?.id));
    expect(a.waste?.id).toBe(b.waste?.id);
  });
});
