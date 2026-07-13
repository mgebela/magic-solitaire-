import type { Card, Rank, RankValue, Suit } from '@three-towers/shared';
import { LAYOUT_VERSION } from '@three-towers/shared';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

const RANKS: { rank: Rank; value: RankValue }[] = [
  { rank: 'ace', value: 1 },
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'jack', value: 11 },
  { rank: 'queen', value: 12 },
  { rank: 'king', value: 13 },
];

/**
 * LAYOUT_VERSION 1 — Microsoft-style TriPeaks overlap map.
 * `COVERED_BY[i]` lists tableau indices that must be removed before card `i` is playable.
 *
 * Row layout (28 cards):
 *        [0]     [1]     [2]
 *      [3] [4] [5] [6] [7] [8]
 *    [9][10][11][12][13][14][15][16][17]
 *      [18][19][20][21][22][23]
 *        [24]  [25]  [26][27]
 */
export const COVERED_BY: readonly (readonly number[])[] = [
  [3, 4],
  [5, 6],
  [7, 8],
  [9, 10],
  [10, 11],
  [11, 12],
  [13, 14],
  [14, 15],
  [16, 17],
  [18, 19],
  [19, 20],
  [20, 21],
  [21, 22],
  [22, 23],
  [22, 23],
  [23],
  [],
  [],
  [24, 25],
  [25, 26],
  [26, 27],
  [26, 27],
  [27],
  [],
  [],
  [],
  [],
  [],
] as const;

export const TABLEAU_SIZE = COVERED_BY.length;

export function getLayoutVersion(): number {
  return LAYOUT_VERSION;
}

export function createStandardDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const { rank, value } of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        value,
      });
    }
  }
  return deck;
}

export function createCardId(card: Card): string {
  return card.id;
}
