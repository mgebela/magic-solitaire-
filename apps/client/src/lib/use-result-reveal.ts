import { useEffect, useState } from 'react';

/** How long the board celebration plays before the result panel covers it. */
const WIN_HOLD_MS = 2200;

/**
 * Losses open at once. Wins wait so the tower burst can land first.
 */
export function useResultReveal(open: boolean, celebrate: boolean): boolean {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    if (!celebrate) {
      setShown(true);
      return;
    }
    const timer = window.setTimeout(() => setShown(true), WIN_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [open, celebrate]);

  return shown;
}
