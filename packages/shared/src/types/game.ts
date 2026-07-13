import type { Card, CardId } from './card';
import type { PuzzleStarThresholds } from './puzzle';

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type GameMode =
  | 'timed'
  | 'relaxed'
  | 'challenge'
  | 'daily'
  | 'puzzle'
  | 'practice'
  | 'ranked'
  | 'casual';

export type MoveType = 'play' | 'draw';

export interface PlayMove {
  type: 'play';
  cardId: CardId;
  timestamp: number;
}

export interface DrawMove {
  type: 'draw';
  timestamp: number;
}

export type Move = PlayMove | DrawMove;

/**
 * TriPeaks tableau: 28 positions (indices 0–27) in LAYOUT_VERSION 1.
 * `null` means the card has been removed to the foundation.
 */
export type Tableau = (Card | null)[];

/**
 * @deprecated Use `Tableau` — kept for reference. One row layer in a single peak.
 */
export type TowerLayer = Card[];

/**
 * @deprecated Use `Tableau` — classic TriPeaks uses 28 indexed positions, not 3×6 peaks.
 */
export type Towers = [TowerLayer, TowerLayer, TowerLayer];

export interface GameState {
  /** Server-generated seed for deterministic deck shuffling. */
  seed: number;
  /** 28-card TriPeaks tableau (null = removed). */
  tableau: Tableau;
  /** Face-down draw pile. */
  stock: Card[];
  /** Current face-up waste card (top of waste pile). */
  waste: Card | null;
  /** Cards removed from towers (foundation / cleared pile). */
  foundation: Card[];
  /** IDs of tableau cards currently playable (uncovered). */
  uncovered: CardId[];
  score: number;
  combo: number;
  moves: Move[];
  status: GameStatus;
  mode: GameMode;
  /** Elapsed time in milliseconds since game start. */
  elapsedMs: number;
  /** Populated when the game ends (won or lost). */
  scoreBreakdown?: ScoreBreakdown;
  /** Puzzle mode — max allowed moves (plays + draws). */
  moveLimit?: number;
  puzzleId?: string;
  /** Puzzle mode — stars earned on completion (0 if lost). */
  starsEarned?: 0 | 1 | 2 | 3;
  /** True after the player uses undo (forfeits no-undo bonus). */
  undoUsed?: boolean;
}

export interface ScoreBreakdown {
  cardsRemoved: number;
  comboBonus: number;
  stockRemaining: number;
  timeBonus: number;
  perfectGameBonus: number;
  difficultyBonus: number;
  fastMoveBonus: number;
  noUndoBonus: number;
  total: number;
}

export interface GameConfig {
  mode: GameMode;
  seed?: number;
  allowUndo: boolean;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  moveLimit?: number;
  puzzleId?: string;
  starThresholds?: PuzzleStarThresholds;
}

/** Client → Server move request. */
export interface MoveRequest {
  gameId: string;
  move: Move;
}

/** Server → Client move response. */
export interface MoveResponse {
  accepted: boolean;
  state?: GameState;
  scoreDelta?: number;
  combo?: number;
  scoreBreakdown?: ScoreBreakdown;
  error?: string;
}

/** Deck seed payload for multiplayer synchronization. */
export interface DeckSeedPayload {
  seed: number;
  layoutVersion: number;
}
