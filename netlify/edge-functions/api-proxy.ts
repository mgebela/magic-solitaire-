export default async (request: Request) => {
  const origin = getApiOrigin();
  if (!origin) {
    // Operators: set Netlify env API_ORIGIN to the NestJS origin to enable accounts.
    return json(
      {
        message:
          'Saved accounts are offline right now. You can still play as a guest.',
      },
      503,
    );
  }

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, origin);
  const headers = new Headers(request.headers);
  headers.delete('host');

  try {
    return await fetch(
      new Request(target, {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      }),
    );
  } catch {
    return json({ message: 'Game server is unreachable. Try again in a moment.' }, 502);
  }
};

function getApiOrigin(): string | null {
  const raw =
    (globalThis as { Netlify?: { env?: { get(name: string): string | undefined } } }).Netlify?.env?.get(
      'API_ORIGIN',
    ) ?? (globalThis as { Deno?: { env: { get(name: string): string | undefined } } }).Deno?.env.get('API_ORIGIN');
  if (!raw) return null;
  return raw.replace(/\/$/, '');
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const config = { path: '/api/*' };
