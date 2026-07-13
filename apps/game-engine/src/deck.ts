import type { Card } from '@three-towers/shared';
import { SeededRandom } from './prng';

/** Fisher-Yates shuffle using a seeded PRNG for deterministic results. */
export function shuffleDeck(deck: Card[], seed: number): Card[] {
  const result = [...deck];
  const rng = new SeededRandom(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function dealTableauAndStock(
  shuffled: Card[],
  tableauSize: number,
): { tableau: Card[]; stock: Card[] } {
  return {
    tableau: shuffled.slice(0, tableauSize),
    stock: shuffled.slice(tableauSize),
  };
}
