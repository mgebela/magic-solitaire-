import { describe, expect, it } from 'vitest';
import {
  SCORING,
  cardPointsForCombo,
  computeCardScoreParts,
  computeFastMoveBonus,
  computePerfectGameBonus,
  computeScoreBreakdown,
  computeStockBonus,
  computeTimeBonus,
} from './scoring';
import type { GameState } from '@three-towers/shared';

const baseConfig = { mode: 'timed' as const, allowUndo: false };

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    seed: 1,
    tableau: Array(28).fill(null),
    stock: [],
    waste: null,
    foundation: [],
    uncovered: [],
    score: 0,
    combo: 0,
    moves: [],
    status: 'won',
    mode: 'timed',
    elapsedMs: 60_000,
    ...overrides,
  };
}

describe('scoring', () => {
  it('awards combo-scaled points per card', () => {
    expect(cardPointsForCombo(1)).toBe(10);
    expect(cardPointsForCombo(3)).toBe(30);
  });

  it('splits card score into base and combo bonus', () => {
    const moves = [
      { type: 'play' as const, cardId: 'a', timestamp: 1 },
      { type: 'play' as const, cardId: 'b', timestamp: 2 },
      { type: 'draw' as const, timestamp: 3 },
      { type: 'play' as const, cardId: 'c', timestamp: 4 },
    ];

    expect(computeCardScoreParts(moves)).toEqual({
      cardsRemoved: 30,
      comboBonus: 10,
    });
  });

  it('applies stock bonus on wins only', () => {
    expect(computeStockBonus(5, true)).toBe(500);
    expect(computeStockBonus(5, false)).toBe(0);
  });

  it('applies time bonus for timed mode', () => {
    expect(computeTimeBonus(10_000, 'timed')).toBe(4_500);
    expect(computeTimeBonus(10_000, 'relaxed')).toBe(0);
    expect(computeTimeBonus(200_000, 'timed')).toBe(0);
  });

  it('awards perfect game bonus with zero draws', () => {
    const moves = [{ type: 'play' as const, cardId: 'a', timestamp: 1 }];
    expect(computePerfectGameBonus(moves, true)).toBe(SCORING.PERFECT_GAME_BONUS);
    expect(computePerfectGameBonus([{ type: 'draw', timestamp: 1 }], true)).toBe(0);
  });

  it('awards fast move bonus for quick consecutive plays', () => {
    const moves = [
      { type: 'play' as const, cardId: 'a', timestamp: 1_000 },
      { type: 'play' as const, cardId: 'b', timestamp: 2_500 },
      { type: 'play' as const, cardId: 'c', timestamp: 6_000 },
    ];

    expect(computeFastMoveBonus(moves)).toBe(SCORING.FAST_MOVE_BONUS);
  });

  it('computes full breakdown on a winning timed game', () => {
    const state = makeState({
      stock: Array(3).fill({ id: 'x', suit: 'hearts', rank: 'A', value: 1 }),
      moves: [
        { type: 'play', cardId: 'a', timestamp: 1_000 },
        { type: 'play', cardId: 'b', timestamp: 2_000 },
      ],
      elapsedMs: 30_000,
      status: 'won',
    });

    const breakdown = computeScoreBreakdown(state, baseConfig);

    expect(breakdown.cardsRemoved).toBe(20);
    expect(breakdown.comboBonus).toBe(10);
    expect(breakdown.stockRemaining).toBe(300);
    expect(breakdown.timeBonus).toBe(3_500);
    expect(breakdown.noUndoBonus).toBe(SCORING.NO_UNDO_BONUS);
    expect(breakdown.total).toBeGreaterThan(breakdown.cardsRemoved + breakdown.comboBonus);
  });

  it('forfeits no-undo bonus when undo was used', () => {
    const state = makeState({
      status: 'won',
      undoUsed: true,
      moves: [{ type: 'play', cardId: 'a', timestamp: 1_000 }],
    });

    expect(computeScoreBreakdown(state, baseConfig).noUndoBonus).toBe(0);
  });
});
