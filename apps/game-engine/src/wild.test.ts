import { describe, expect, it } from 'vitest';
import type { Card, GameState, Rank, RankValue } from '@three-towers/shared';
import { GameEngine, InvalidMoveError, wildOfferOpen } from './game-engine';
import { computeUncovered } from './moves';
import { computeCardScoreParts } from './scoring';

const RANKS: Rank[] = [
  'ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'jack',
  'queen',
  'king',
];

function card(value: RankValue, id: string): Card {
  return { id, suit: 'spades', rank: RANKS[value - 1], value };
}

function stuckAfterOnePeak(): GameState {
  const tableau = Array<Card | null>(28).fill(null);
  tableau[0] = card(5, 'clubs-5');
  tableau[18] = card(10, 'diamonds-10');
  return {
    seed: 7,
    tableau,
    stock: [],
    waste: card(6, 'hearts-6'),
    foundation: [],
    uncovered: computeUncovered(tableau),
    score: 0,
    combo: 1,
    moves: [],
    status: 'playing',
    mode: 'relaxed',
    elapsedMs: 0,
    wildHeld: false,
    wildDeclined: false,
  };
}

describe('relaxed wild', () => {
  it('offers a wild when a peak clears and the stock is already empty', () => {
    const engine = new GameEngine({ mode: 'relaxed', allowUndo: true, seed: 7 }, stuckAfterOnePeak());

    const state = engine.applyMove({ type: 'play', cardId: 'clubs-5', timestamp: 1 });

    expect(state.tableau[0]).toBeNull();
    expect(state.status).toBe('playing');
    expect(wildOfferOpen(state)).toBe(true);
  });

  it('lets a saved wild take a card that is not one rank away', () => {
    const engine = new GameEngine({ mode: 'relaxed', allowUndo: true, seed: 7 }, stuckAfterOnePeak());
    engine.applyMove({ type: 'play', cardId: 'clubs-5', timestamp: 1 });
    engine.applyMove({ type: 'play', cardId: '~wild-keep', timestamp: 2 });

    const state = engine.applyMove({ type: 'play', cardId: '~wild:diamonds-10', timestamp: 3 });

    expect(state.status).toBe('won');
    expect(state.wildHeld).toBe(false);
    expect(state.wildDeclined).toBe(true);
    expect(state.waste?.id).toBe('diamonds-10');
  });

  it('ends the hand when the wild is left and nothing else plays', () => {
    const engine = new GameEngine({ mode: 'relaxed', allowUndo: true, seed: 7 }, stuckAfterOnePeak());
    engine.applyMove({ type: 'play', cardId: 'clubs-5', timestamp: 1 });

    const state = engine.applyMove({ type: 'play', cardId: '~wild-discard', timestamp: 2 });

    expect(state.status).toBe('lost');
    expect(state.wildDeclined).toBe(true);
  });

  it('refuses a wild in timed', () => {
    const engine = new GameEngine(
      { mode: 'timed', allowUndo: false, seed: 7 },
      { ...stuckAfterOnePeak(), mode: 'timed' },
    );

    expect(() => engine.applyMove({ type: 'play', cardId: '~wild-keep', timestamp: 1 })).toThrow(
      InvalidMoveError,
    );
  });

  it('keeps the combo through a keep-wild move', () => {
    const parts = computeCardScoreParts([
      { type: 'play', cardId: 'a', timestamp: 1 },
      { type: 'play', cardId: 'b', timestamp: 2 },
      { type: 'keep-wild', timestamp: 3 },
      { type: 'play', cardId: 'c', timestamp: 4, wild: true },
    ]);

    expect(parts).toEqual({ cardsRemoved: 30, comboBonus: 30 });
  });
});
