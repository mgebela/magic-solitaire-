export {
  GameEngine,
  replayGame,
  ENGINE_VERSION,
  shuffleDeck,
  createStandardDeck,
  dealTableauAndStock,
  COVERED_BY,
  TABLEAU_SIZE,
  getLayoutVersion,
  canPlayCard,
  computeUncovered,
  countRemainingTableauCards,
  clearedPeakCount,
  clearedPeaks,
  findTableauIndex,
  getPlayableCards,
  hasAnyPlay,
  isRankAdjacent,
  wildOfferOpen,
  WILD_KEEP_CARD,
  WILD_DISCARD_CARD,
  WILD_PLAY_PREFIX,
  SeededRandom,
  GameEngineError,
  InvalidMoveError,
  GameOverError,
} from './game-engine';
export {
  computePuzzleStars,
  movesRemaining,
} from './puzzle';
export { getHint } from './hints';
export {
  SCORING,
  cardPointsForCombo,
  computeScoreBreakdown,
} from './scoring';
export {
  AI_DIFFICULTIES,
  AI_DELAY_MS,
  chooseAiMove,
  getAiThinkDelay,
  type AiDifficulty,
} from './ai';
