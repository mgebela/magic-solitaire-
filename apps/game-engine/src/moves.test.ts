import { describe, expect, it } from 'vitest';
import type { Card, Tableau } from '@three-towers/shared';
import { COVERED_BY } from './layout';
import {
  canPlayCard,
  computeUncovered,
  countRemainingTableauCards,
  isRankAdjacent,
} from './moves';

function card(id: string, value: Card['value']): Card {
  const rank = value === 1 ? 'ace' : value === 13 ? 'king' : String(value) as Card['rank'];
  return { id, suit: 'hearts', rank, value };
}

describe('isRankAdjacent', () => {
  it('accepts consecutive ranks', () => {
    expect(isRankAdjacent(7, 8)).toBe(true);
    expect(isRankAdjacent(7, 6)).toBe(true);
  });

  it('wraps ace and king', () => {
    expect(isRankAdjacent(1, 13)).toBe(true);
    expect(isRankAdjacent(13, 1)).toBe(true);
    expect(isRankAdjacent(1, 2)).toBe(true);
  });

  it('rejects same rank and distant ranks', () => {
    expect(isRankAdjacent(7, 7)).toBe(false);
    expect(isRankAdjacent(7, 9)).toBe(false);
    expect(isRankAdjacent(3, 10)).toBe(false);
  });
});

describe('canPlayCard', () => {
  it('requires a waste card', () => {
    expect(canPlayCard(card('a', 5), null)).toBe(false);
  });

  it('validates rank adjacency', () => {
    expect(canPlayCard(card('a', 6), card('b', 7))).toBe(true);
    expect(canPlayCard(card('a', 10), card('b', 7))).toBe(false);
  });
});

describe('computeUncovered', () => {
  it('exposes bottom-row cards initially', () => {
    const tableau: Tableau = Array.from({ length: COVERED_BY.length }, (_, i) =>
      card(`c${i}`, ((i % 13) + 1) as Card['value']),
    );

    const uncovered = computeUncovered(tableau);

    // Bottom row indices 24–27 are always uncovered
    expect(uncovered).toContain('c24');
    expect(uncovered).toContain('c25');
    expect(uncovered).toContain('c26');
    expect(uncovered).toContain('c27');

    // Top row cards are blocked
    expect(uncovered).not.toContain('c0');
  });

  it('uncovers a card when blockers are removed', () => {
    const tableau: Tableau = Array.from({ length: COVERED_BY.length }, (_, i) =>
      card(`c${i}`, ((i % 13) + 1) as Card['value']),
    );

    // Remove blockers for card 0 (indices 3 and 4)
    tableau[3] = null;
    tableau[4] = null;

    const uncovered = computeUncovered(tableau);
    expect(uncovered).toContain('c0');
  });
});

describe('countRemainingTableauCards', () => {
  it('counts non-null tableau slots', () => {
    const tableau: Tableau = [card('a', 1), null, card('b', 2)];
    expect(countRemainingTableauCards(tableau)).toBe(2);
  });
});
