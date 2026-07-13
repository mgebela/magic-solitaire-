import type { GameState, GameStats } from '@three-towers/shared';
import { TRIPEAKS_TABLEAU_CARD_COUNT } from '@three-towers/shared';
import { computeScoreBreakdown } from '@three-towers/game-engine';

export function computeGameStats(
  state: GameState,
  options?: { isPersonalBest?: boolean },
): GameStats {
  const cardsCleared = state.foundation.length;
  const maxCombo = state.moves.reduce((max, move, index, moves) => {
    if (move.type !== 'play') return max;

    let combo = 1;
    for (let i = index - 1; i >= 0; i--) {
      if (moves[i].type === 'play') combo++;
      else break;
    }

    return Math.max(max, combo);
  }, state.combo);

  const scoreBreakdown =
    state.scoreBreakdown ??
    (state.status !== 'playing'
      ? computeScoreBreakdown(state, { mode: state.mode, allowUndo: false })
      : undefined);

  return {
    score: state.score,
    elapsedMs: state.elapsedMs,
    movesCount: state.moves.length,
    cardsCleared,
    maxCombo: Math.max(maxCombo, state.combo),
    stockRemaining: state.stock.length,
    status: state.status,
    mode: state.mode,
    scoreBreakdown,
    isPersonalBest: options?.isPersonalBest,
  };
}

export function remainingTableauCards(state: GameState): number {
  return TRIPEAKS_TABLEAU_CARD_COUNT - state.foundation.length;
}
