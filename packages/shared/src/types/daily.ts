import type { GameState, GameStatus } from './game';
import type { LeaderboardEntry } from './game-api';

export interface DailyChallengeInfo {
  date: string;
  seed: number;
  layoutVersion: number;
  attempt: DailyAttemptSummary | null;
}

export interface DailyAttemptSummary {
  gameId: string;
  status: GameStatus;
  score: number;
  elapsedMs: number;
  finishedAt?: string;
}

export interface DailyChallengeResponse extends DailyChallengeInfo {
  canPlay: boolean;
  state?: GameState;
}

export interface DailyLeaderboardResponse {
  date: string;
  entries: LeaderboardEntry[];
}
