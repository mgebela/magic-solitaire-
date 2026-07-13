import type { CardId, GameConfig, Move } from '@three-towers/shared';
import type { GameEngine } from './game-engine';
import { COVERED_BY } from './layout';
import {
  computeUncovered,
  findTableauIndex,
  getPlayableCards,
} from './moves';

export type AiDifficulty = NonNullable<GameConfig['difficulty']>;

export const AI_DIFFICULTIES: AiDifficulty[] = ['easy', 'medium', 'hard', 'expert'];

export const AI_DELAY_MS: Record<AiDifficulty, { min: number; max: number }> = {
  easy: { min: 450, max: 900 },
  medium: { min: 280, max: 550 },
  hard: { min: 160, max: 320 },
  expert: { min: 90, max: 180 },
};

/** Chance the AI picks a random valid move instead of the best one. */
const MISTAKE_RATE: Record<AiDifficulty, number> = {
  easy: 0.45,
  medium: 0.18,
  hard: 0.05,
  expert: 0,
};

/** Chance easy AI draws even when a play exists. */
const BAD_DRAW_RATE: Record<AiDifficulty, number> = {
  easy: 0.12,
  medium: 0,
  hard: 0,
  expert: 0,
};

export function getAiThinkDelay(difficulty: AiDifficulty, random = Math.random()): number {
  const { min, max } = AI_DELAY_MS[difficulty];
  return Math.floor(min + random * (max - min));
}

function countNewlyUnlocked(tableau: (import('@three-towers/shared').Card | null)[], removedIndex: number): number {
  let count = 0;

  for (let i = 0; i < tableau.length; i++) {
    if (!tableau[i]) continue;

    const blockers = COVERED_BY[i] ?? [];
    if (!blockers.includes(removedIndex)) continue;

    const remainingBlockers = blockers.filter((b) => b !== removedIndex && tableau[b] !== null);
    if (remainingBlockers.length === 0) {
      count++;
    }
  }

  return count;
}

function scorePlayMove(
  engine: GameEngine,
  cardId: CardId,
  difficulty: AiDifficulty,
): number {
  const state = engine.getState();
  const index = findTableauIndex(state.tableau, cardId);
  if (index === -1) return -Infinity;

  const tableau = [...state.tableau];
  tableau[index] = null;

  const beforeUncovered = new Set(state.uncovered);
  const afterUncovered = computeUncovered(tableau);
  const newlyPlayable = afterUncovered.filter((id) => !beforeUncovered.has(id)).length;
  const unlocked = countNewlyUnlocked(state.tableau, index);

  let score = 0;
  score += unlocked * 18;
  score += newlyPlayable * 8;
  score += state.combo * 6;

  const remaining = tableau.filter((c) => c !== null).length;
  score += (28 - remaining) * 0.5;

  if (difficulty === 'expert') {
    score += estimateFollowUpValue(engine, cardId) * 12;
  }

  return score;
}

/** One-ply lookahead: best immediate follow-up after this play. */
function estimateFollowUpValue(engine: GameEngine, cardId: CardId): number {
  const state = engine.getState();
  const index = findTableauIndex(state.tableau, cardId);
  const card = state.tableau[index];
  if (!card) return 0;

  const tableau = [...state.tableau];
  tableau[index] = null;
  const uncovered = computeUncovered(tableau);

  const followUps = getPlayableCards(tableau, uncovered, card);
  if (followUps.length === 0) return 0;

  return followUps.reduce((best, followUp) => {
    const unlocked = countNewlyUnlocked(tableau, findTableauIndex(tableau, followUp.id));
    return Math.max(best, unlocked * 2 + 1);
  }, 0);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Choose the next move for an AI opponent.
 * Returns null when the AI session is not actively playing.
 */
export function chooseAiMove(
  engine: GameEngine,
  difficulty: AiDifficulty,
  random = Math.random,
): Move | null {
  const state = engine.getState();
  if (state.status !== 'playing') return null;

  const timestamp = Date.now();
  const plays = engine.getValidPlays();

  if (plays.length === 0) {
    if (!engine.canDraw()) return null;
    return { type: 'draw', timestamp };
  }

  if (random() < BAD_DRAW_RATE[difficulty] && engine.canDraw()) {
    return { type: 'draw', timestamp };
  }

  if (random() < MISTAKE_RATE[difficulty]) {
    return { type: 'play', cardId: pickRandom(plays), timestamp };
  }

  let bestId = plays[0];
  let bestScore = -Infinity;

  for (const cardId of plays) {
    const score = scorePlayMove(engine, cardId, difficulty);
    if (score > bestScore) {
      bestScore = score;
      bestId = cardId;
    }
  }

  return { type: 'play', cardId: bestId, timestamp };
}
