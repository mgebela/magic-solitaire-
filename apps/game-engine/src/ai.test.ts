import { describe, expect, it } from 'vitest';
import { GameEngine } from './game-engine';
import {
  AI_DIFFICULTIES,
  AI_DELAY_MS,
  chooseAiMove,
  getAiThinkDelay,
} from './ai';

const seed = 583920174;

describe('AI', () => {
  it('exposes all difficulty levels with think delays', () => {
    expect(AI_DIFFICULTIES).toEqual(['easy', 'medium', 'hard', 'expert']);

    for (const difficulty of AI_DIFFICULTIES) {
      const delay = getAiThinkDelay(difficulty, 0.5);
      const { min, max } = AI_DELAY_MS[difficulty];
      expect(delay).toBeGreaterThanOrEqual(min);
      expect(delay).toBeLessThanOrEqual(max);
    }
  });

  it('chooses a legal move when plays exist', () => {
    const engine = new GameEngine({ mode: 'practice', allowUndo: false, seed });
    engine.init();

    let move = null;
    for (let i = 0; i < 30; i++) {
      move = chooseAiMove(engine, 'hard', () => 0.99);
      if (move) break;
      if (engine.getValidPlays().length > 0) break;
      if (engine.canDraw()) engine.applyMove({ type: 'draw', timestamp: i });
    }

    expect(move).not.toBeNull();
    if (move?.type === 'play') {
      expect(engine.canPlay(move.cardId)).toBe(true);
    }
  });

  it('draws from stock when no plays are available', () => {
    const engine = new GameEngine({ mode: 'practice', allowUndo: false, seed: 42 });
    engine.init();

    let foundNoPlays = false;
    for (let i = 0; i < 40; i++) {
      if (engine.getValidPlays().length === 0 && engine.canDraw()) {
        const move = chooseAiMove(engine, 'expert');
        expect(move?.type).toBe('draw');
        foundNoPlays = true;
        break;
      }

      const plays = engine.getValidPlays();
      if (plays.length > 0) {
        engine.applyMove({ type: 'play', cardId: plays[0], timestamp: i });
      } else if (engine.canDraw()) {
        engine.applyMove({ type: 'draw', timestamp: i });
      } else {
        break;
      }
    }

    expect(foundNoPlays).toBe(true);
  });

  it('can play a full game without throwing', () => {
    const engine = new GameEngine({ mode: 'practice', allowUndo: false, seed: 999 });
    engine.init();

    let moves = 0;
    while (engine.getState().status === 'playing' && moves < 300) {
      const move = chooseAiMove(engine, 'medium', () => 0.99);
      if (!move) break;
      engine.applyMove(move);
      moves++;
    }

    expect(moves).toBeGreaterThan(0);
    expect(['won', 'lost', 'playing']).toContain(engine.getState().status);
  });

  it('expert AI performs at least as well as easy on the same seeds', () => {
    const samples = [101, 202, 303, 404, 505, 606, 707];
    let expertTotal = 0;
    let easyTotal = 0;

    for (const s of samples) {
      const expert = new GameEngine({ mode: 'practice', allowUndo: false, seed: s });
      expert.init();
      const easy = new GameEngine({ mode: 'practice', allowUndo: false, seed: s });
      easy.init();

      for (let i = 0; i < 200; i++) {
        if (expert.getState().status === 'playing') {
          const move = chooseAiMove(expert, 'expert', () => 0.99);
          if (move) expert.applyMove(move);
        }
        if (easy.getState().status === 'playing') {
          const move = chooseAiMove(easy, 'easy', () => 0.01);
          if (move) easy.applyMove(move);
        }
      }

      expertTotal += expert.getState().foundation.length;
      easyTotal += easy.getState().foundation.length;
    }

    expect(expertTotal).toBeGreaterThanOrEqual(easyTotal);
    expect(expertTotal).toBeGreaterThan(0);
  });
});
