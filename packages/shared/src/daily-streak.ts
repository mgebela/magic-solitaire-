export interface DailyStreak {
  current: number;
  best: number;
}

function shiftUtcDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function streaksFromDates(isoDates: string[], todayIso: string): DailyStreak {
  const unique = [...new Set(isoDates)].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;

  for (const day of unique) {
    run = previous && shiftUtcDate(previous, 1) === day ? run + 1 : 1;
    if (run > best) best = run;
    previous = day;
  }

  const played = new Set(unique);
  let current = 0;
  const start = played.has(todayIso) ? todayIso : shiftUtcDate(todayIso, -1);
  let cursor = start;
  while (played.has(cursor)) {
    current += 1;
    cursor = shiftUtcDate(cursor, -1);
  }

  return { current, best };
}
