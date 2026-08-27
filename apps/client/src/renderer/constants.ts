export const CARD_WIDTH = 90;
export const CARD_HEIGHT = 126;
export const CARD_RADIUS = 10;

export const SUIT_COLORS = {
  hearts: 0xcc3333,
  diamonds: 0xcc3333,
  clubs: 0x1a1a2e,
  spades: 0x1a1a2e,
} as const;

export const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export const RANK_LABELS: Record<string, string> = {
  ace: 'A',
  jack: 'J',
  queen: 'Q',
  king: 'K',
};

export function rankLabel(rank: string): string {
  return RANK_LABELS[rank] ?? rank;
}
