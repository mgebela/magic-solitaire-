export function movesRemaining(moveLimit: number, movesUsed: number): number {
  return Math.max(0, moveLimit - movesUsed);
}
