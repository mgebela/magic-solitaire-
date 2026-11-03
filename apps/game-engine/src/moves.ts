import type { Card, CardId, Tableau } from '@three-towers/shared';
import { COVERED_BY } from './layout';

export function isRankAdjacent(a: number, b: number): boolean {
  if (a === b) return false;
  if (Math.abs(a - b) === 1) return true;
  return (a === 1 && b === 13) || (a === 13 && b === 1);
}

export function canPlayCard(card: Card, waste: Card | null): boolean {
  if (!waste) return true;
  return isRankAdjacent(card.value, waste.value);
}

export function findTableauIndex(tableau: Tableau, cardId: CardId): number {
  return tableau.findIndex((card) => card?.id === cardId);
}

/** True when this slot still has a card and nothing is sitting on it. */
export function isSlotOpen(tableau: Tableau, index: number): boolean {
  const card = tableau[index];
  if (card == null) return false;
  const blockers = COVERED_BY[index] ?? [];
  return blockers.every((child) => tableau[child] == null);
}

export function computeUncovered(tableau: Tableau): CardId[] {
  const uncovered: CardId[] = [];

  for (let i = 0; i < tableau.length; i++) {
    if (!isSlotOpen(tableau, i)) continue;
    const card = tableau[i];
    if (card) uncovered.push(card.id);
  }

  return uncovered;
}

export function countRemainingTableauCards(tableau: Tableau): number {
  return tableau.filter((card) => card !== null).length;
}

export function getPlayableCards(
  tableau: Tableau,
  uncovered: CardId[],
  waste: Card | null,
): Card[] {
  const uncoveredSet = new Set(uncovered);
  const playable: Card[] = [];

  for (const card of tableau) {
    if (!card || !uncoveredSet.has(card.id)) continue;
    if (canPlayCard(card, waste)) {
      playable.push(card);
    }
  }

  return playable;
}

export function hasAnyPlay(tableau: Tableau, uncovered: CardId[], waste: Card | null): boolean {
  return getPlayableCards(tableau, uncovered, waste).length > 0;
}

/** Peak tops. A tower is clear only when its top card and every card under it are gone. */
export const PEAK_TOP_INDICES = [0, 1, 2] as const;

function pyramidEmpty(tableau: Tableau, index: number): boolean {
  if (tableau[index] != null) return false;
  for (const child of COVERED_BY[index] ?? []) {
    if (!pyramidEmpty(tableau, child)) return false;
  }
  return true;
}

export function clearedPeaks(tableau: Tableau): [boolean, boolean, boolean] {
  return [
    pyramidEmpty(tableau, 0),
    pyramidEmpty(tableau, 1),
    pyramidEmpty(tableau, 2),
  ];
}

export function clearedPeakCount(tableau: Tableau): number {
  return clearedPeaks(tableau).filter(Boolean).length;
}
