import type {
  Card,
  CardId,
  GameConfig,
  GameState,
  Move,
  Tableau,
} from '@three-towers/shared';
import {
  TRIPEAKS_TABLEAU_CARD_COUNT,
  TRIPEAKS_STOCK_CARD_COUNT,
} from '@three-towers/shared';
import { dealTableauAndStock, shuffleDeck } from './deck';
import { GameOverError, InvalidMoveError } from './errors';
import { createStandardDeck } from './layout';
import {
  canPlayCard,
  computeUncovered,
  countRemainingTableauCards,
  findTableauIndex,
  getPlayableCards,
  hasAnyPlay,
} from './moves';
import { SeededRandom } from './prng';
import {
  cardPointsForCombo,
  computeScoreBreakdown,
} from './scoring';
import { computePuzzleStars } from './puzzle';

export const ENGINE_VERSION = '1.0.0';

/**
 * Pure TypeScript TriPeaks game engine.
 * No React, no DOM, no network dependencies.
 */
export class GameEngine {
  private state: GameState;

  private history: GameState[] = [];

  readonly config: GameConfig;

  constructor(config: GameConfig, initialState?: GameState) {
    this.config = config;
    this.state = initialState ?? this.createInitialState();
    this.history = [];
  }

  getState(): GameState {
    return structuredClone(this.state);
  }

  init(): GameState {
    this.history = [];
    this.state = this.createInitialState();
    return this.getState();
  }

  applyMove(move: Move): GameState {
    this.assertGameActive();
    this.pushHistory();

    if (move.type === 'play') {
      this.applyPlayMove(move.cardId, move.timestamp);
    } else {
      this.applyDrawMove(move.timestamp);
    }

    this.resolveEndState();
    return this.getState();
  }

  canUndo(): boolean {
    return (
      this.config.allowUndo &&
      this.state.status === 'playing' &&
      this.history.length > 0
    );
  }

  undo(): GameState {
    if (!this.canUndo()) {
      throw new InvalidMoveError('Cannot undo');
    }

    const snapshot = this.history.pop();
    if (!snapshot) {
      throw new InvalidMoveError('Cannot undo');
    }

    this.state = { ...snapshot, undoUsed: true, status: 'playing' };
    return this.getState();
  }

  canPlay(cardId: CardId): boolean {
    if (this.state.status !== 'playing') return false;
    if (!this.state.uncovered.includes(cardId)) return false;
    if (!this.state.waste) return false;

    const index = findTableauIndex(this.state.tableau, cardId);
    if (index === -1) return false;

    const card = this.state.tableau[index];
    return card !== null && canPlayCard(card, this.state.waste);
  }

  canDraw(): boolean {
    return this.state.status === 'playing' && this.state.stock.length > 0;
  }

  getValidPlays(): CardId[] {
    if (this.state.status !== 'playing' || !this.state.waste) return [];
    return getPlayableCards(this.state.tableau, this.state.uncovered, this.state.waste).map(
      (c) => c.id,
    );
  }

  setElapsedMs(elapsedMs: number): GameState {
    this.state = { ...this.state, elapsedMs };
    return this.getState();
  }

  getScoreBreakdown() {
    return computeScoreBreakdown(this.state, this.config);
  }

  private createInitialState(): GameState {
    const actualSeed =
      this.config.seed ??
      new SeededRandom((Date.now() >>> 0) ^ (Math.random() * 1e9)).nextInt(1, 2_147_483_647);

    const deck = createStandardDeck();
    const shuffled = shuffleDeck(deck, actualSeed);
    const { tableau: tableauCards, stock } = dealTableauAndStock(
      shuffled,
      TRIPEAKS_TABLEAU_CARD_COUNT,
    );

    if (tableauCards.length !== TRIPEAKS_TABLEAU_CARD_COUNT) {
      throw new Error(`Expected ${TRIPEAKS_TABLEAU_CARD_COUNT} tableau cards`);
    }
    if (stock.length !== TRIPEAKS_STOCK_CARD_COUNT) {
      throw new Error(`Expected ${TRIPEAKS_STOCK_CARD_COUNT} stock cards`);
    }

    const tableau: Tableau = [...tableauCards];
    const waste = this.drawFromStock(stock);

    const state: GameState = {
      seed: actualSeed,
      tableau,
      stock,
      waste,
      foundation: [],
      uncovered: computeUncovered(tableau),
      score: 0,
      combo: 0,
      moves: [],
      status: 'playing',
      mode: this.config.mode,
      elapsedMs: 0,
      moveLimit: this.config.moveLimit,
      puzzleId: this.config.puzzleId,
      undoUsed: false,
    };

    return state;
  }

  private pushHistory(): void {
    if (!this.config.allowUndo || this.state.status !== 'playing') return;

    const { scoreBreakdown: _ignored, ...rest } = this.state;
    this.history.push(structuredClone(rest));
  }

  private drawFromStock(stock: Card[]): Card {
    const card = stock.shift();
    if (!card) {
      throw new Error('Stock is empty');
    }
    return card;
  }

  private applyPlayMove(cardId: CardId, timestamp: number): void {
    if (!this.canPlay(cardId)) {
      throw new InvalidMoveError(`Cannot play card: ${cardId}`);
    }

    const index = findTableauIndex(this.state.tableau, cardId);
    const card = this.state.tableau[index] as Card;

    const tableau = [...this.state.tableau];
    tableau[index] = null;

    const combo = this.state.combo + 1;
    const scoreDelta = cardPointsForCombo(combo);

    this.state = {
      ...this.state,
      tableau,
      waste: card,
      foundation: [...this.state.foundation, card],
      uncovered: computeUncovered(tableau),
      combo,
      score: this.state.score + scoreDelta,
      moves: [...this.state.moves, { type: 'play', cardId, timestamp }],
    };
  }

  private applyDrawMove(timestamp: number): void {
    if (!this.canDraw()) {
      throw new InvalidMoveError('Cannot draw — stock is empty or game is over');
    }

    const stock = [...this.state.stock];
    const waste = this.drawFromStock(stock);

    this.state = {
      ...this.state,
      stock,
      waste,
      combo: 0,
      moves: [...this.state.moves, { type: 'draw', timestamp }],
    };
  }

  private resolveEndState(): void {
    if (this.isPuzzleMoveLimitExceeded()) {
      this.state = { ...this.state, status: 'lost', starsEarned: 0 };
      return;
    }

    if (countRemainingTableauCards(this.state.tableau) === 0) {
      this.state = { ...this.state, status: 'won' };
      this.finalizeScoring();
      return;
    }

    if (
      this.state.stock.length === 0 &&
      !hasAnyPlay(this.state.tableau, this.state.uncovered, this.state.waste)
    ) {
      this.state = { ...this.state, status: 'lost' };
      this.finalizeScoring();
      return;
    }

    if (this.isPuzzleMoveLimitReached()) {
      this.state = { ...this.state, status: 'lost', starsEarned: 0 };
    }
  }

  private isPuzzleMoveLimitExceeded(): boolean {
    return (
      this.config.mode === 'puzzle' &&
      this.config.moveLimit !== undefined &&
      this.state.moves.length > this.config.moveLimit
    );
  }

  private isPuzzleMoveLimitReached(): boolean {
    return (
      this.config.mode === 'puzzle' &&
      this.config.moveLimit !== undefined &&
      this.state.moves.length >= this.config.moveLimit
    );
  }

  private finalizeScoring(): void {
    if (this.config.mode === 'puzzle') {
      const stars =
        this.state.status === 'won' &&
        this.config.starThresholds &&
        this.config.moveLimit
          ? computePuzzleStars(
              this.state.moves.length,
              this.config.starThresholds,
              this.config.moveLimit,
              true,
            )
          : 0;

      this.state = { ...this.state, starsEarned: stars };
      return;
    }

    const breakdown = computeScoreBreakdown(this.state, this.config);
    this.state = {
      ...this.state,
      score: this.state.status === 'won' ? breakdown.total : this.state.score,
      scoreBreakdown: breakdown,
    };
  }

  private assertGameActive(): void {
    if (this.state.status !== 'playing') {
      throw new GameOverError(`Game is already ${this.state.status}`);
    }

    if (this.isPuzzleMoveLimitReached()) {
      throw new GameOverError('Move limit reached');
    }
  }
}

/** Rebuild engine state by replaying moves from a seeded deal. */
export function replayGame(
  config: GameConfig,
  moves: Move[],
  elapsedMs = 0,
): GameEngine {
  const engine = new GameEngine(config);
  engine.init();

  for (const move of moves) {
    engine.applyMove(move);
  }

  engine.setElapsedMs(elapsedMs);
  return engine;
}

// Re-export utilities for testing and server validation
export { shuffleDeck, dealTableauAndStock } from './deck';
export { COVERED_BY, TABLEAU_SIZE, getLayoutVersion, createStandardDeck } from './layout';
export {
  canPlayCard,
  computeUncovered,
  countRemainingTableauCards,
  findTableauIndex,
  getPlayableCards,
  hasAnyPlay,
  isRankAdjacent,
} from './moves';
export { SeededRandom } from './prng';
export {
  SCORING,
  cardPointsForCombo,
  computeCardScoreParts,
  computeScoreBreakdown,
  computeEndGameBonusDelta,
  computeFastMoveBonus,
  computeTimeBonus,
  computeStockBonus,
  computePerfectGameBonus,
} from './scoring';
export {
  computePuzzleStars,
  movesRemaining,
} from './puzzle';
export { getHint } from './hints';
export { GameEngineError, InvalidMoveError, GameOverError } from './errors';
