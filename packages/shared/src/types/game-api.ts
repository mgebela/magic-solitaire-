import type { GameMode, GameState, GameStatus, Move, ScoreBreakdown } from './game';

export type SinglePlayerMode = 'timed' | 'relaxed';

export interface CreateGameRequest {
  mode: SinglePlayerMode;
  seed?: number;
}

export interface GameSessionResponse {
  id: string;
  state: GameState;
  mode: GameMode;
  startedAt: string;
  finishedAt?: string;
}

export interface SubmitMoveRequest {
  move: Move;
  elapsedMs: number;
}

export interface GameSummary {
  id: string;
  mode: GameMode;
  status: GameStatus;
  score: number;
  elapsedMs: number;
  startedAt: string;
  finishedAt?: string;
}

export interface GameStats {
  score: number;
  elapsedMs: number;
  movesCount: number;
  cardsCleared: number;
  maxCombo: number;
  stockRemaining: number;
  status: GameStatus;
  mode: GameMode;
  scoreBreakdown?: ScoreBreakdown;
  isPersonalBest?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  elapsedMs: number;
  finishedAt: string;
}

export interface PersonalBestResponse {
  mode: GameMode;
  bestScore: number | null;
  bestElapsedMs: number | null;
  rank: number | null;
  totalWins: number;
  gamesPlayed: number;
}
