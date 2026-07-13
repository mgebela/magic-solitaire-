import { describe, expect, it } from 'vitest';
import { GameEngine, getHint } from './game-engine';

describe('getHint', () => {
  it('returns a draw when no plays are available', () => {
    const engine = new GameEngine({ mode: 'relaxed', allowUndo: true, seed: 42 });
    engine.init();

    let hint = getHint(engine);
    for (let i = 0; i < 40 && hint?.type !== 'draw'; i++) {
      const plays = engine.getValidPlays();
      if (plays.length > 0) {
        engine.applyMove({ type: 'play', cardId: plays[0], timestamp: i });
      } else {
        break;
      }
      hint = getHint(engine);
    }

    if (engine.getValidPlays().length === 0 && engine.canDraw()) {
      expect(hint?.type).toBe('draw');
    }
  });

  it('returns a valid play when one exists', () => {
    const engine = new GameEngine({ mode: 'relaxed', allowUndo: true, seed: 583920174 });
    engine.init();

    const hint = getHint(engine);
    expect(hint).not.toBeNull();

    if (hint?.type === 'play') {
      expect(engine.canPlay(hint.cardId)).toBe(true);
    }
  });
});
