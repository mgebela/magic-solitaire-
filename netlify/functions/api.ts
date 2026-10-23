import { createHash, createHmac, randomUUID } from 'crypto';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export const config = { path: '/api/*' };

const ACCESS_TTL_SEC = 900;
const REFRESH_TTL_SEC = 60 * 60 * 24 * 7;
const NONCE_WINDOW_MS = 5 * 60 * 1000;
const WELCOME_TOKENS = 25;
const TOKEN_PACKAGES = [
  {
    id: 'pack_starter',
    name: 'Starter Pack',
    tokens: 50,
    priceUsd: 4.99,
    cryptoAmount: '0.05',
    chain: 'solana',
    description: '50 Solitaire Tokens — ~5 multiplayer games',
  },
  {
    id: 'pack_standard',
    name: 'Standard Pack',
    tokens: 150,
    priceUsd: 12.99,
    cryptoAmount: '0.12',
    chain: 'solana',
    description: '150 Solitaire Tokens — ~15 multiplayer games',
  },
  {
    id: 'pack_pro',
    name: 'Pro Pack',
    tokens: 500,
    priceUsd: 39.99,
    cryptoAmount: '0.35',
    chain: 'solana',
    description: '500 Solitaire Tokens — ~50 multiplayer games',
  },
];

export default async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const origin = process.env.API_ORIGIN?.replace(/\/$/, '');
  if (origin) {
    return proxyToOrigin(request, origin);
  }

  try {
    return await handleLocalApi(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    const status = (err as { status?: number }).status ?? 500;
    return json({ message }, status);
  }
};

async function proxyToOrigin(request: Request, origin: string): Promise<Response> {
  const incoming = new URL(request.url);
  const route = apiRoute(incoming.pathname);
  const target = new URL(`/api${route === '/' ? '' : route}${incoming.search}`, origin);
  const headers = new Headers(request.headers);
  headers.delete('host');
  try {
    const upstream = await fetch(
      new Request(target, {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      }),
    );
    const body = await upstream.arrayBuffer();
    const out = new Headers(upstream.headers);
    corsHeaders().forEach((value, key) => out.set(key, value));
    return new Response(body, { status: upstream.status, headers: out });
  } catch {
    return json({ message: 'Game server is unreachable. Try again in a moment.' }, 502);
  }
}

function apiRoute(pathname: string): string {
  const raw = decodeURIComponent(pathname).replace(/\/+$/, '') || '/';
  const prefixes = ['/.netlify/functions/api', '/api'];
  for (const prefix of prefixes) {
    if (raw === prefix) return '/';
    if (raw.startsWith(`${prefix}/`)) return raw.slice(prefix.length) || '/';
  }
  return raw.startsWith('/') ? raw : `/${raw}`;
}

async function handleLocalApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const route = apiRoute(url.pathname);

  if (request.method === 'GET' && route === '/') {
    return json({
      name: 'Three Towers Solitaire API',
      version: '0.1.0',
      mode: 'netlify-wallet',
    });
  }

  if (request.method === 'GET' && route === '/health') {
    return json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: { database: false, walletAuth: true },
    });
  }

  if (request.method === 'GET' && route === '/leaderboard') {
    return json([]);
  }

  if (request.method === 'GET' && route === '/leaderboard/personal') {
    const mode = url.searchParams.get('mode') || 'timed';
    return json({
      mode,
      bestScore: null,
      bestElapsedMs: null,
      rank: null,
      totalWins: 0,
      gamesPlayed: 0,
    });
  }

  if (request.method === 'GET' && route === '/auth/wallet/nonce') {
    const address = url.searchParams.get('address') ?? '';
    return createNonce(address);
  }

  if (request.method === 'POST' && route === '/auth/wallet/verify') {
    const body = (await request.json().catch(() => null)) as {
      message?: string;
      signature?: string;
    } | null;
    return verifyWallet(body?.message ?? '', body?.signature ?? '');
  }

  if (request.method === 'GET' && route === '/auth/me') {
    return getProfile(request);
  }

  if (request.method === 'POST' && route === '/auth/logout') {
    return json({ message: 'Signed out' });
  }

  if (
    request.method === 'POST' &&
    (route === '/auth/login' || route === '/auth/register' || route === '/auth/forgot-password')
  ) {
    throw httpError(503, 'Email sign-in needs the full game server. Use a Solana wallet here.');
  }

  if (request.method === 'GET' && route === '/tokens/packages') {
    return json({
      packages: TOKEN_PACKAGES,
      treasuryAddress: '',
      multiplayerEntryCost: 10,
    });
  }

  if (request.method === 'GET' && route === '/profile/stats') {
    return json({
      user: publicUserFromPayload(requireAccess(request)),
      totals: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalElapsedMs: 0,
        dailyStreak: 0,
        dailyBestStreak: 0,
      },
      byMode: [],
      recentGames: [],
    });
  }

  if (request.method === 'GET' && route === '/games/recent') {
    requireAccess(request);
    return json([]);
  }

  throw httpError(404, `Cannot ${request.method} ${route}`);
}

function createNonce(address: string): Response {
  const pubkey = parseSolanaAddress(address);
  const normalized = encodePublicKey(pubkey);
  const nonce = windowNonce(normalized, currentWindow());
  const message = buildSignInMessage(normalized, nonce);
  return json({
    nonce,
    message,
    network: process.env.SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet',
  });
}

function verifyWallet(message: string, signature: string): Response {
  if (!message || !signature) {
    throw httpError(400, 'Message and signature are required');
  }

  const address = extractAddressFromMessage(message);
  if (!address) {
    throw httpError(401, 'Invalid sign-in message');
  }

  const pubkey = parseSolanaAddress(address);
  const normalized = encodePublicKey(pubkey);
  const nonce = extractNonceFromMessage(message);
  if (!nonce || !isValidNonce(normalized, nonce)) {
    throw httpError(401, 'Sign-in expired — request a new wallet nonce');
  }

  const expected = buildSignInMessage(normalized, nonce);
  if (message !== expected) {
    throw httpError(401, 'Sign-in message does not match server nonce');
  }

  if (!verifySignature(message, signature, pubkey)) {
    throw httpError(401, 'Invalid Solana wallet signature');
  }

  const now = new Date().toISOString();
  const user = {
    id: uuidFromAddress(normalized),
    email: null,
    username: `player_${normalized.slice(0, 6)}`,
    walletAddress: normalized,
    walletChain: 'solana' as const,
    authMethod: 'wallet' as const,
    tokenBalance: WELCOME_TOKENS,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };

  const subject = normalized;
  const tokens = {
    accessToken: signJwt({ sub: user.id, email: subject, type: 'access', username: user.username }, ACCESS_TTL_SEC),
    refreshToken: signJwt({ sub: user.id, email: subject, type: 'refresh', username: user.username }, REFRESH_TTL_SEC),
    expiresIn: ACCESS_TTL_SEC,
  };

  return json({ user, tokens });
}

type AccessPayload = { sub: string; email: string; type: string; username?: string };

function requireAccess(request: Request): AccessPayload {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = token ? verifyJwt(token) : null;
  if (!payload || payload.type !== 'access') {
    throw httpError(401, 'Unauthorized');
  }
  return payload;
}

function publicUserFromPayload(payload: AccessPayload) {
  const address = payload.email;
  const now = new Date().toISOString();
  return {
    id: payload.sub,
    email: null,
    username: payload.username ?? `player_${String(address).slice(0, 6)}`,
    walletAddress: address,
    walletChain: 'solana' as const,
    authMethod: 'wallet' as const,
    tokenBalance: WELCOME_TOKENS,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };
}

function getProfile(request: Request): Response {
  return json(publicUserFromPayload(requireAccess(request)));
}

function buildSignInMessage(address: string, nonce: string): string {
  return ['Sign in to Three Towers Solitaire', `Wallet: ${address}`, `Nonce: ${nonce}`].join('\n');
}

function extractAddressFromMessage(message: string): string | null {
  const match = message.match(/^Wallet: ([1-9A-HJ-NP-Za-km-z]{32,44})$/m);
  return match?.[1] ?? null;
}

function extractNonceFromMessage(message: string): string | null {
  const match = message.match(/^Nonce: ([0-9a-f]{32})$/m);
  return match?.[1] ?? null;
}

function currentWindow(): number {
  return Math.floor(Date.now() / NONCE_WINDOW_MS);
}

function windowNonce(address: string, window: number): string {
  return createHmac('sha256', authSecret())
    .update(`${address}:${window}`)
    .digest('hex')
    .slice(0, 32);
}

function isValidNonce(address: string, nonce: string): boolean {
  const window = currentWindow();
  return nonce === windowNonce(address, window) || nonce === windowNonce(address, window - 1);
}

function parseSolanaAddress(address: string): Uint8Array {
  try {
    const bytes = bs58.decode(address.trim());
    if (bytes.length !== 32) throw new Error('bad length');
    return bytes;
  } catch {
    throw httpError(400, 'Invalid Solana wallet address');
  }
}

function encodePublicKey(pubkey: Uint8Array): string {
  return bs58.encode(pubkey);
}

function verifySignature(message: string, signatureBase58: string, pubkey: Uint8Array): boolean {
  try {
    const signature = bs58.decode(signatureBase58);
    if (signature.length !== 64) return false;
    return nacl.sign.detached.verify(new TextEncoder().encode(message), signature, pubkey);
  } catch {
    return false;
  }
}

function uuidFromAddress(address: string): string {
  const hash = createHash('sha256').update(address).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function signJwt(payload: Record<string, unknown>, expiresInSec: number): string {
  const header = base64Url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const now = Math.floor(Date.now() / 1000);
  const body = base64Url(
    Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + expiresInSec, jti: randomUUID() })),
  );
  const sig = createHmac('sha256', authSecret()).update(`${header}.${body}`).digest();
  return `${header}.${body}.${base64Url(sig)}`;
}

function verifyJwt(token: string): { sub: string; email: string; type: string; username?: string } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = base64Url(createHmac('sha256', authSecret()).update(`${header}.${body}`).digest());
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      sub: string;
      email: string;
      type: string;
      username?: string;
      exp?: number;
    };
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function authSecret(): string {
  return process.env.JWT_SECRET || process.env.NETLIFY_SITE_ID || 'space-towers-netlify-auth';
}

function base64Url(buf: Buffer): string {
  return buf.toString('base64url');
}

function httpError(status: number, message: string): Error {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...Object.fromEntries(corsHeaders()),
    },
  });
}

function corsHeaders(): Headers {
  return new Headers({
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Content-Type, Authorization',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
  });
}
