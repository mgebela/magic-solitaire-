import type { GameMode } from './game';
import type { GameSummary } from './game-api';
import type { UserPublic } from './auth';

export interface ModeStatistics {
  mode: GameMode;
  gamesPlayed: number;
  wins: number;
  losses: number;
  bestScore: number | null;
  bestElapsedMs: number | null;
  averageScore: number | null;
}

export interface PlayerTotals {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  totalElapsedMs: number;
}

export interface PlayerStatisticsResponse {
  user: UserPublic;
  totals: PlayerTotals;
  byMode: ModeStatistics[];
  recentGames: GameSummary[];
}
