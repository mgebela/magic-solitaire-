import type { GameConfig, GameState, Move, ScoreBreakdown } from '@three-towers/shared';

export const SCORING = {
  BASE_CARD: 10,
  STOCK_BONUS_PER_CARD: 100,
  TIME_BONUS_CAP: 5_000,
  TIME_PENALTY_PER_SEC: 50,
  PERFECT_GAME_BONUS: 1_000,
  FAST_MOVE_THRESHOLD_MS: 2_000,
  FAST_MOVE_BONUS: 25,
  NO_UNDO_BONUS: 500,
  DIFFICULTY: {
    easy: 0,
    medium: 200,
    hard: 500,
    expert: 1_000,
  } as const,
} as const;

export function cardPointsForCombo(combo: number): number {
  return SCORING.BASE_CARD * combo;
}

/** Split running card score into base vs combo multiplier bonus. */
export function computeCardScoreParts(moves: Move[]): {
  cardsRemoved: number;
  comboBonus: number;
} {
  let combo = 0;
  let cardsRemoved = 0;
  let comboBonus = 0;

  for (const move of moves) {
    if (move.type !== 'play') {
      combo = 0;
      continue;
    }

    combo++;
    cardsRemoved += SCORING.BASE_CARD;
    comboBonus += SCORING.BASE_CARD * (combo - 1);
  }

  return { cardsRemoved, comboBonus };
}

export function countDrawMoves(moves: Move[]): number {
  return moves.filter((m) => m.type === 'draw').length;
}

export function computeFastMoveBonus(moves: Move[]): number {
  let bonus = 0;
  let lastPlayTimestamp: number | null = null;

  for (const move of moves) {
    if (move.type !== 'play') {
      lastPlayTimestamp = null;
      continue;
    }

    if (
      lastPlayTimestamp !== null &&
      move.timestamp - lastPlayTimestamp <= SCORING.FAST_MOVE_THRESHOLD_MS
    ) {
      bonus += SCORING.FAST_MOVE_BONUS;
    }

    lastPlayTimestamp = move.timestamp;
  }

  return bonus;
}

export function computeTimeBonus(elapsedMs: number, mode: GameState['mode']): number {
  if (mode !== 'timed' && mode !== 'daily') return 0;

  const seconds = Math.floor(elapsedMs / 1_000);
  return Math.max(0, SCORING.TIME_BONUS_CAP - seconds * SCORING.TIME_PENALTY_PER_SEC);
}

export function computeStockBonus(stockRemaining: number, won: boolean): number {
  if (!won) return 0;
  return stockRemaining * SCORING.STOCK_BONUS_PER_CARD;
}

export function computePerfectGameBonus(moves: Move[], won: boolean): number {
  if (!won || countDrawMoves(moves) > 0) return 0;
  return SCORING.PERFECT_GAME_BONUS;
}

export function computeNoUndoBonus(state: GameState): number {
  return state.undoUsed ? 0 : SCORING.NO_UNDO_BONUS;
}

export function computeDifficultyBonus(config: GameConfig): number {
  if (!config.difficulty) return 0;
  return SCORING.DIFFICULTY[config.difficulty];
}

export function computeScoreBreakdown(
  state: GameState,
  config: GameConfig,
): ScoreBreakdown {
  const won = state.status === 'won';
  const { cardsRemoved, comboBonus } = computeCardScoreParts(state.moves);

  const stockRemaining = computeStockBonus(state.stock.length, won);
  const timeBonus = computeTimeBonus(state.elapsedMs, state.mode);
  const perfectGameBonus = computePerfectGameBonus(state.moves, won);
  const fastMoveBonus = won ? computeFastMoveBonus(state.moves) : 0;
  const noUndoBonus = won ? computeNoUndoBonus(state) : 0;
  const difficultyBonus = won ? computeDifficultyBonus(config) : 0;

  const total =
    cardsRemoved +
    comboBonus +
    stockRemaining +
    timeBonus +
    perfectGameBonus +
    fastMoveBonus +
    noUndoBonus +
    difficultyBonus;

  return {
    cardsRemoved,
    comboBonus,
    stockRemaining,
    timeBonus,
    perfectGameBonus,
    fastMoveBonus,
    noUndoBonus,
    difficultyBonus,
    total,
  };
}

export function computeEndGameBonusDelta(
  state: GameState,
  config: GameConfig,
): number {
  const { cardsRemoved, comboBonus } = computeCardScoreParts(state.moves);
  const cardTotal = cardsRemoved + comboBonus;
  const breakdown = computeScoreBreakdown(state, config);
  return breakdown.total - cardTotal;
}
