import { CARD_HEIGHT, CARD_WIDTH } from './constants';

export interface CardPosition {
  x: number;
  y: number;
  layer: number;
}

export const BOARD_WIDTH = 960;
export const BOARD_HEIGHT = 640;
export const STONE_PANEL_TOP = 500;

/**
 * LAYOUT_VERSION 1 — must match apps/game-engine/src/layout.ts
 *
 *        [0]     [1]     [2]
 *      [3] [4] [5] [6] [7] [8]
 *    [9][10][11][12][13][14][15][16][17]
 *      [18][19][20][21][22][23]
 *        [24]  [25]  [26][27]
 *
 * Row 2 is one continuous 9-card row (cards overlap at peak seams).
 * Higher `layer` = drawn on top (bottom pyramid rows in front).
 */
export function buildTableauPositions(): CardPosition[] {
  const positions: CardPosition[] = new Array(28);

  const overlapX = CARD_WIDTH * 0.5;
  const overlapY = 28;
  const row2Left = (BOARD_WIDTH - (8 * overlapX + CARD_WIDTH)) / 2;
  const row4Top = STONE_PANEL_TOP - CARD_HEIGHT - 24;

  const rowY = {
    r0: row4Top - overlapY * 4,
    r1: row4Top - overlapY * 3,
    r2: row4Top - overlapY * 2,
    r3: row4Top - overlapY,
    r4: row4Top,
  };

  const x2 = (index: number) => row2Left + (index - 9) * overlapX;
  const peakCenter = (middleIndex: number) => x2(middleIndex) + CARD_WIDTH / 2;

  const place = (index: number, leftX: number, row: keyof typeof rowY, layer: number) => {
    positions[index] = { x: leftX, y: rowY[row], layer };
  };

  // Row 0 — peak tops (centered over each third of row 2)
  place(0, peakCenter(10) - CARD_WIDTH / 2, 'r0', 0);
  place(1, peakCenter(13) - CARD_WIDTH / 2, 'r0', 0);
  place(2, peakCenter(16) - CARD_WIDTH / 2, 'r0', 0);

  // Row 1 — two cards per peak, aligned with row 2 columns
  place(3, x2(9), 'r1', 1);
  place(4, x2(10), 'r1', 1);
  place(5, x2(12), 'r1', 1);
  place(6, x2(13), 'r1', 1);
  place(7, x2(15), 'r1', 1);
  place(8, x2(16), 'r1', 1);

  // Row 2 — continuous nine-card row
  for (let i = 9; i <= 17; i++) {
    place(i, x2(i), 'r2', 2 + (i - 9) * 0.01);
  }

  // Row 3 — bridging pairs between peaks
  place(18, x2(9), 'r3', 3);
  place(19, x2(10), 'r3', 3);
  place(20, x2(12), 'r3', 3);
  place(21, x2(13), 'r3', 3);
  place(22, x2(15), 'r3', 3);
  place(23, x2(16), 'r3', 3);

  // Row 4 — exposed bottom (playable at deal start)
  place(24, peakCenter(10) - CARD_WIDTH / 2, 'r4', 4);
  place(25, peakCenter(13) - CARD_WIDTH / 2, 'r4', 4);
  place(26, x2(15), 'r4', 4);
  place(27, x2(16), 'r4', 4.01);

  return positions;
}

export const TABLEAU_POSITIONS = buildTableauPositions();

const PANEL_CARD_Y = STONE_PANEL_TOP + 28;

export const STOCK_POSITION: CardPosition = { x: 72, y: PANEL_CARD_Y, layer: 20 };
export const WASTE_POSITION: CardPosition = { x: 168, y: PANEL_CARD_Y, layer: 21 };
export const FOUNDATION_POSITION: CardPosition = { x: 264, y: PANEL_CARD_Y, layer: 20 };

/** Peak indices for tower orb decorations. */
export const PEAK_INDICES = [0, 1, 2] as const;
