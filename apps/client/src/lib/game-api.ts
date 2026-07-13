import type {
  CreateGameRequest,
  GameSessionResponse,
  GameSummary,
  Move,
  MoveResponse,
} from '@three-towers/shared';
import { apiFetch } from './api';

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export function createGame(
  accessToken: string,
  dto: CreateGameRequest,
): Promise<GameSessionResponse> {
  return apiFetch<GameSessionResponse>('/games', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(dto),
  });
}

export function getGame(accessToken: string, gameId: string): Promise<GameSessionResponse> {
  return apiFetch<GameSessionResponse>(`/games/${gameId}`, {
    headers: authHeaders(accessToken),
  });
}

export function submitMove(
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

export function listRecentGames(accessToken: string): Promise<GameSummary[]> {
  return apiFetch<GameSummary[]>('/games/recent', {
    headers: authHeaders(accessToken),
  });
}
