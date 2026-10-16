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

  const contentType = response.headers.get('content-type') ?? '';
  const rawText = await response.text().catch(() => '');
  const trimmed = rawText.trim();
  const looksLikeJson = trimmed.startsWith('{') || trimmed.startsWith('[');
  const isJson = contentType.includes('application/json') || looksLikeJson;
  let body: unknown = null;
  if (isJson && trimmed) {
    try {
      body = JSON.parse(trimmed) as unknown;
    } catch {
      body = null;
    }
  }

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

  if (body === null) {
    const looksLikeHtml = /^\s*</.test(rawText);
    throw new ApiError(
      looksLikeHtml
        ? 'Game server is offline. Wallet sign-in needs the API connected.'
        : 'Invalid response from server (expected JSON).',
      response.status,
      { url, contentType, preview: rawText.slice(0, 200) },
    );
  }

  return body as T;
}
