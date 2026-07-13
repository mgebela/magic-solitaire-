/** Format milliseconds as m:ss.cs (centiseconds). */
export function formatElapsed(ms: number): string {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);

  return `${min}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export function formatMode(mode: string): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

/** Human-readable duration for aggregate play time. */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 60) return `${totalMinutes}m`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatWinRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
