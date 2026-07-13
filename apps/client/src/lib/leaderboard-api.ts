import type {
  LeaderboardEntry,
  PersonalBestResponse,
  SinglePlayerMode,
} from '@three-towers/shared';
import { apiFetch } from './api';

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export function getLeaderboard(mode: SinglePlayerMode = 'timed'): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>(`/leaderboard?mode=${mode}`);
}

export function getPersonalBest(
  accessToken: string,
  mode: SinglePlayerMode = 'timed',
): Promise<PersonalBestResponse> {
  return apiFetch<PersonalBestResponse>(`/leaderboard/personal?mode=${mode}`, {
    headers: authHeaders(accessToken),
  });
}
