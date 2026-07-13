/** UTC calendar date for a daily challenge (YYYY-MM-DD). */
export function getDailyChallengeDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Deterministic deck seed from a calendar date — same for all players worldwide. */
export function getDailySeed(date = new Date()): number {
  const dateStr = getDailyChallengeDate(date);
  let hash = 2_654_435_761;

  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 1_597_334_677);
    hash >>>= 0;
  }

  return (hash % 2_147_483_646) + 1;
}

export function parseDailyChallengeDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
