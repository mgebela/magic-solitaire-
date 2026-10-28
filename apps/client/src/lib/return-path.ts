const ALLOWED = new Set(['/daily', '/multiplayer', '/profile']);

export function returnPath(value: string | null | undefined): string {
  if (value && ALLOWED.has(value)) return value;
  return '/';
}

export function returnPathNote(path: string): string | null {
  if (path === '/daily') return 'Sign in to play today’s shared board.';
  if (path === '/multiplayer') return 'Sign in to race a room.';
  return null;
}
