import { describe, expect, it } from 'vitest';
import {
  TRIPEAKS_STOCK_CARD_COUNT,
  TRIPEAKS_TABLEAU_CARD_COUNT,
  TRIPEAKS_TOTAL_CARD_COUNT,
} from '@three-towers/shared';
import { createStandardDeck, TABLEAU_SIZE } from './layout';
import { dealTableauAndStock, shuffleDeck } from './deck';

describe('deck', () => {
  it('creates a standard 52-card deck', () => {
    const deck = createStandardDeck();
    expect(deck).toHaveLength(TRIPEAKS_TOTAL_CARD_COUNT);

    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(52);
  });

  it('shuffles deterministically with the same seed', () => {
    const deck = createStandardDeck();
    const a = shuffleDeck(deck, 583920174);
    const b = shuffleDeck(deck, 583920174);

    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id));
  });

  it('shuffles differently with different seeds', () => {
    const deck = createStandardDeck();
    const a = shuffleDeck(deck, 1);
    const b = shuffleDeck(deck, 2);

    expect(a.map((c) => c.id)).not.toEqual(b.map((c) => c.id));
  });

  it('deals 28 tableau + 24 stock cards', () => {
    const shuffled = shuffleDeck(createStandardDeck(), 12345);
    const { tableau, stock } = dealTableauAndStock(shuffled, TABLEAU_SIZE);

    expect(tableau).toHaveLength(TRIPEAKS_TABLEAU_CARD_COUNT);
    expect(stock).toHaveLength(TRIPEAKS_STOCK_CARD_COUNT);
  });
});
