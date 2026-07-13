import type { Move } from '@three-towers/shared';
import type { GameEngine } from './game-engine';
import { chooseAiMove } from './ai';

/**
 * Suggest the best next move using hard AI heuristics.
 * Returns null when the game is not actively playing.
 */
export function getHint(engine: GameEngine): Move | null {
  return chooseAiMove(engine, 'hard');
}
