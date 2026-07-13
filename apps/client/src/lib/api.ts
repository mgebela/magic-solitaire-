const API_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}/api${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (body as { message?: string | string[] })?.message ??
      `Request failed with status ${response.status}`;
    throw new ApiError(
      Array.isArray(message) ? message.join(', ') : message,
      response.status,
      body,
    );
  }

  return body as T;
}
