import { useEffect, useState } from 'react';

/** How long the board celebration plays before the result panel covers it. */
const WIN_HOLD_MS = 2200;
/** How long the towers stay dark before a loss panel covers them. */
const LOSS_HOLD_MS = 1100;

/**
 * Wins wait for the tower burst. Losses wait for the orbs to go dark.
 */
export function useResultReveal(open: boolean, celebrate: boolean): boolean {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const timer = window.setTimeout(() => setShown(true), celebrate ? WIN_HOLD_MS : LOSS_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [open, celebrate]);

  return shown;
}
