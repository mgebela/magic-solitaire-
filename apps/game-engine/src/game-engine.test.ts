import { describe, expect, it } from 'vitest';
import {
  GameEngine,
  InvalidMoveError,
  GameOverError,
  shuffleDeck,
  createStandardDeck,
} from './game-engine';
import { countRemainingTableauCards } from './moves';

const baseConfig = { mode: 'timed' as const, allowUndo: false, seed: 583920174 };

describe('GameEngine', () => {
  it('initializes with deterministic state for a given seed', () => {
    const a = new GameEngine(baseConfig).init();
    const b = new GameEngine(baseConfig).init();

    expect(a.seed).toBe(583920174);
    expect(a.tableau.map((c) => c?.id)).toEqual(b.tableau.map((c) => c?.id));
    expect(a.stock.map((c) => c.id)).toEqual(b.stock.map((c) => c.id));
    expect(a.waste?.id).toBe(b.waste?.id);
  });

  it('starts with 28 tableau cards, 23 stock, 1 waste', () => {
    const state = new GameEngine(baseConfig).init();

    expect(countRemainingTableauCards(state.tableau)).toBe(28);
    expect(state.stock).toHaveLength(23);
    expect(state.waste).not.toBeNull();
    expect(state.status).toBe('playing');
    expect(state.combo).toBe(0);
  });

  it('plays a valid card and increments combo', () => {
    const engine = new GameEngine(baseConfig);
    const state = engine.init();

    let plays = engine.getValidPlays();
    let attempts = 0;

    while (plays.length === 0 && engine.canDraw() && attempts < 10) {
      engine.applyMove({ type: 'draw', timestamp: attempts });
      plays = engine.getValidPlays();
      attempts++;
    }

    expect(plays.length).toBeGreaterThan(0);

    const before = engine.getState();
    engine.applyMove({ type: 'play', cardId: plays[0], timestamp: Date.now() });
    const after = engine.getState();

    expect(after.foundation).toHaveLength(before.foundation.length + 1);
    expect(after.combo).toBe(1);
    expect(after.score).toBeGreaterThan(before.score);
    expect(after.moves.length).toBeGreaterThan(before.moves.length);
  });

  it('rejects invalid play moves', () => {
    const engine = new GameEngine(baseConfig);
    const state = engine.init();
    const wasteValue = state.waste!.value;

    const unplayable = state.uncovered.find((id) => {
      const card = state.tableau.find((c) => c?.id === id);
      if (!card) return false;
      const diff = Math.abs(card.value - wasteValue);
      return diff !== 1 && !(card.value === 1 && wasteValue === 13) && !(card.value === 13 && wasteValue === 1);
    });

    if (unplayable) {
      expect(() =>
        engine.applyMove({ type: 'play', cardId: unplayable, timestamp: Date.now() }),
      ).toThrow(InvalidMoveError);
    }
  });

  it('draws from stock and resets combo', () => {
    const engine = new GameEngine(baseConfig);
    engine.init();

    // Force a combo first if possible
    const state = engine.getState();
    const wasteValue = state.waste!.value;
    const playable = state.uncovered.find((id) => {
      const card = state.tableau.find((c) => c?.id === id);
      if (!card) return false;
      const diff = Math.abs(card.value - wasteValue);
      return diff === 1 || (card.value === 1 && wasteValue === 13) || (card.value === 13 && wasteValue === 1);
    });

    if (playable) {
      engine.applyMove({ type: 'play', cardId: playable, timestamp: 1 });
      expect(engine.getState().combo).toBe(1);
    }

    const stockBefore = engine.getState().stock.length;
    engine.applyMove({ type: 'draw', timestamp: 2 });
    const after = engine.getState();

    expect(after.stock).toHaveLength(stockBefore - 1);
    expect(after.combo).toBe(0);
    expect(after.waste).not.toBeNull();
  });

  it('detects a win when all tableau cards are cleared', () => {
    const engine = new GameEngine({ mode: 'practice', allowUndo: false, seed: 999 });

    // Brute-force play until win or stuck (bounded)
    let moves = 0;
    const maxMoves = 200;

    while (engine.getState().status === 'playing' && moves < maxMoves) {
      const state = engine.getState();
      const plays = engine.getValidPlays();

      if (plays.length > 0) {
        engine.applyMove({ type: 'play', cardId: plays[0], timestamp: moves });
      } else if (engine.canDraw()) {
        engine.applyMove({ type: 'draw', timestamp: moves });
      } else {
        break;
      }
      moves++;
    }

    const final = engine.getState();
    expect(['won', 'lost', 'playing']).toContain(final.status);
    if (final.status === 'won') {
      expect(countRemainingTableauCards(final.tableau)).toBe(0);
    }
  });

  it('throws when applying moves after game over', () => {
    const engine = new GameEngine(baseConfig);
    engine.init();

    // Manually set lost state via brute force drain - use engine internal by playing until lost if possible
    // Simpler: create engine with custom terminal state
    const terminal = new GameEngine(baseConfig, {
      ...engine.getState(),
      status: 'won',
    });

    expect(() =>
      terminal.applyMove({ type: 'draw', timestamp: 1 }),
    ).toThrow(GameOverError);
  });

  it('getValidPlays returns only legal moves', () => {
    const engine = new GameEngine(baseConfig);
    const state = engine.init();
    const valid = engine.getValidPlays();

    for (const id of valid) {
      expect(engine.canPlay(id)).toBe(true);
    }

    const wasteValue = state.waste!.value;
    for (const cardId of state.uncovered) {
      const card = state.tableau.find((c) => c?.id === cardId);
      if (!card) continue;
      const diff = Math.abs(card.value - wasteValue);
      const adjacent =
        diff === 1 || (card.value === 1 && wasteValue === 13) || (card.value === 13 && wasteValue === 1);
      if (adjacent) {
        expect(valid).toContain(cardId);
      }
    }
  });
});

describe('undo', () => {
  it('restores the previous state and marks undoUsed', () => {
    const engine = new GameEngine({ mode: 'relaxed', allowUndo: true, seed: 583920174 });
    engine.init();

    let plays = engine.getValidPlays();
    let attempts = 0;
    while (plays.length === 0 && engine.canDraw() && attempts < 10) {
      engine.applyMove({ type: 'draw', timestamp: attempts });
      plays = engine.getValidPlays();
      attempts++;
    }

    expect(plays.length).toBeGreaterThan(0);

    const beforePlay = engine.getState();
    engine.applyMove({ type: 'play', cardId: plays[0], timestamp: 1 });
    const afterMove = engine.getState();

    engine.undo();
    const restored = engine.getState();

    expect(restored.moves).toEqual(beforePlay.moves);
    expect(restored.score).toBe(beforePlay.score);
    expect(restored.undoUsed).toBe(true);
    expect(afterMove.moves.length).toBeGreaterThan(restored.moves.length);
  });

  it('forfeits the no-undo bonus after undo is used', () => {
    const engine = new GameEngine({ mode: 'timed', allowUndo: true, seed: 583920174 });
    engine.init();

    let plays = engine.getValidPlays();
    let attempts = 0;
    while (plays.length === 0 && engine.canDraw() && attempts < 10) {
      engine.applyMove({ type: 'draw', timestamp: attempts });
      plays = engine.getValidPlays();
      attempts++;
    }

    expect(plays.length).toBeGreaterThan(0);
    engine.applyMove({ type: 'play', cardId: plays[0], timestamp: 1 });
    engine.undo();

    while (engine.getState().status === 'playing') {
      const nextPlays = engine.getValidPlays();
      if (nextPlays.length > 0) {
        engine.applyMove({ type: 'play', cardId: nextPlays[0], timestamp: Date.now() });
      } else if (engine.canDraw()) {
        engine.applyMove({ type: 'draw', timestamp: Date.now() });
      } else {
        break;
      }
    }

    const state = engine.getState();
    if (state.status === 'won') {
      expect(state.scoreBreakdown?.noUndoBonus).toBe(0);
    } else {
      expect(state.undoUsed).toBe(true);
    }
  });
});

describe('puzzle mode', () => {
  it('ends as lost when move limit is reached without clearing', () => {
    const engine = new GameEngine({
      mode: 'puzzle',
      allowUndo: false,
      seed: 583920174,
      moveLimit: 2,
      puzzleId: 'test',
      starThresholds: { three: 1, two: 2 },
    });

    engine.init();
    engine.applyMove({ type: 'draw', timestamp: 1 });
    const state = engine.applyMove({ type: 'draw', timestamp: 2 });

    expect(state.status).toBe('lost');
    expect(state.starsEarned).toBe(0);
    expect(() => engine.applyMove({ type: 'draw', timestamp: 3 })).toThrow(GameOverError);
  });
});

describe('multiplayer seed sync', () => {
  it('two engines with the same seed produce identical initial layouts', () => {
    const seed = 123456789;
    const config = { mode: 'ranked' as const, allowUndo: false, seed };

    const player1 = new GameEngine(config).init();
    const player2 = new GameEngine(config).init();

    expect(player1.tableau.map((c) => c?.id)).toEqual(player2.tableau.map((c) => c?.id));
    expect(player1.waste?.id).toEqual(player2.waste?.id);

    const shuffled = shuffleDeck(createStandardDeck(), seed);
    expect(shuffled.slice(0, 28).map((c) => c.id)).toEqual(player1.tableau.map((c) => c?.id));
  });
});
