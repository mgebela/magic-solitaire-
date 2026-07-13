import type {
  DailyChallengeResponse,
  DailyLeaderboardResponse,
  Move,
  MoveResponse,
} from '@three-towers/shared';
import { apiFetch } from './api';

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export function getTodayChallenge(accessToken: string): Promise<DailyChallengeResponse> {
  return apiFetch<DailyChallengeResponse>('/daily/today', {
    headers: authHeaders(accessToken),
  });
}

export function startDailyChallenge(accessToken: string): Promise<DailyChallengeResponse> {
  return apiFetch<DailyChallengeResponse>('/daily/start', {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
}

export function getDailyLeaderboard(date?: string): Promise<DailyLeaderboardResponse> {
  const query = date ? `?date=${date}` : '';
  return apiFetch<DailyLeaderboardResponse>(`/daily/leaderboard${query}`);
}

export function submitDailyMove(
  accessToken: string,
  gameId: string,
  move: Move,
  elapsedMs: number,
): Promise<MoveResponse> {
  return apiFetch<MoveResponse>(`/games/${gameId}/moves`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ move, elapsedMs }),
  });
}
