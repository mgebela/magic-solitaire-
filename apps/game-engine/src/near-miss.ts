import type { Tableau } from '@three-towers/shared';

/** Cards that sit on each tower, including that tower’s share of the bottom row. */
const TOWERS = [
  { name: 'left', indices: [0, 3, 4, 9, 10, 11, 18, 19, 20] },
  { name: 'middle', indices: [1, 5, 6, 12, 13, 14, 21, 22, 23] },
  { name: 'right', indices: [2, 7, 8, 15, 16, 17, 24, 25, 26, 27] },
] as const;

/**
 * One sentence for a lost deal.
 * A single tower with one or two cards left wins. Otherwise a broken chain of ×4 or more.
 * Anything else names how many cards are still on the peaks.
 */
export function lossLead(tableau: Tableau, maxCombo: number): string {
  const live = TOWERS.map((tower) => ({
    name: tower.name,
    count: tower.indices.filter((index) => tableau[index] != null).length,
  })).filter((tower) => tower.count > 0);

  if (live.length === 1 && live[0].count <= 2) {
    const { name, count } = live[0];
    return count === 1
      ? `One card left on the ${name} tower.`
      : `Two cards left on the ${name} tower.`;
  }

  if (maxCombo >= 4) {
    return `The chain died at ×${maxCombo}.`;
  }

  const left = live.reduce((sum, tower) => sum + tower.count, 0);
  return left === 1 ? '1 card still on the peaks.' : `${left} cards still on the peaks.`;
}
