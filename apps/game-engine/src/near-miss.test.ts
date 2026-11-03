import { describe, expect, it } from 'vitest';
import type { Tableau } from '@three-towers/shared';
import { lossLead } from './near-miss';

function tableauWith(filled: number[]): Tableau {
  const tableau: Tableau = Array.from({ length: 28 }, () => null);
  for (const index of filled) {
    tableau[index] = {
      id: `c${index}`,
      suit: 'spades',
      rank: 'ace',
      value: 1,
    };
  }
  return tableau;
}

describe('lossLead', () => {
  it('names one or two cards left on a single tower', () => {
    expect(lossLead(tableauWith([27]), 0)).toBe('One card left on the right tower.');
    expect(lossLead(tableauWith([26, 27]), 6)).toBe('Two cards left on the right tower.');
    expect(lossLead(tableauWith([0]), 0)).toBe('One card left on the left tower.');
    expect(lossLead(tableauWith([1, 5]), 0)).toBe('Two cards left on the middle tower.');
  });

  it('names a broken chain when the miss is not a single tower', () => {
    expect(lossLead(tableauWith([0, 1, 2, 18]), 5)).toBe('The chain died at ×5.');
  });

  it('counts the cards still on the peaks', () => {
    const filled = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    expect(lossLead(tableauWith(filled), 2)).toBe('14 cards still on the peaks.');
  });
});
