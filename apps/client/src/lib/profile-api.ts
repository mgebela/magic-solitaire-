import type { PlayerStatisticsResponse } from '@three-towers/shared';
import { apiFetch } from './api';

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export function getPlayerStatistics(accessToken: string): Promise<PlayerStatisticsResponse> {
  return apiFetch<PlayerStatisticsResponse>('/profile/stats', {
    headers: authHeaders(accessToken),
  });
}
