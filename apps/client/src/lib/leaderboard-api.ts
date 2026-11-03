import type {
  LeaderboardPeriod,
  PersonalBestResponse,
  SinglePlayerMode,
  TopScoresResponse,
} from '@three-towers/shared';
import { apiFetch } from './api';

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export function getTopScores(
  period: LeaderboardPeriod = 'today',
  accessToken?: string,
): Promise<TopScoresResponse> {
  return apiFetch<TopScoresResponse>(`/leaderboard/top?period=${period}`, {
    headers: accessToken ? authHeaders(accessToken) : undefined,
  });
}

export function getPersonalBest(
  accessToken: string,
  mode: SinglePlayerMode = 'timed',
): Promise<PersonalBestResponse> {
  return apiFetch<PersonalBestResponse>(`/leaderboard/personal?mode=${mode}`, {
    headers: authHeaders(accessToken),
  });
}
