import { CARD_HEIGHT, CARD_WIDTH } from './constants';

export interface CardPosition {
  x: number;
  y: number;
  layer: number;
}

export const BOARD_WIDTH = 960;
export const BOARD_HEIGHT = 640;

/** Top of the stone dashboard — stock/waste sit on this slab. */
export const STONE_PANEL_TOP = 502;
export const STONE_PANEL_HEIGHT = BOARD_HEIGHT - STONE_PANEL_TOP;

/**
 * LAYOUT_VERSION 2 — classic TriPeaks, must match apps/game-engine/src/layout.ts
 *
 *        [0]         [1]         [2]
 *      [3] [4]     [5] [6]     [7] [8]
 *    [9][10][11] [12][13][14] [15][16][17]
 *  [18][19][20][21][22][23][24][25][26][27]
 *
 * The 10-card base spans nearly the full board width, matching Space Towers.
 */
export function buildTableauPositions(): CardPosition[] {
  const positions: CardPosition[] = new Array(28);

  const sideMargin = 22;
  const bottomWidth = BOARD_WIDTH - sideMargin * 2;
  const hStep = (bottomWidth - CARD_WIDTH) / 9;
  const vStep = 58;
  const startX = sideMargin;
  /** Sit the 10-card row just above the stock/waste on the stone lip. */
  const bottomY = STONE_PANEL_TOP - CARD_HEIGHT - 68;

  const slot = (col: number, row: number, layer: number): CardPosition => ({
    x: startX + col * hStep,
    y: bottomY - (3 - row) * vStep,
    layer,
  });

  positions[0] = slot(1.5, 0, 1);
  positions[1] = slot(4.5, 0, 1);
  positions[2] = slot(7.5, 0, 1);

  positions[3] = slot(1, 1, 2);
  positions[4] = slot(2, 1, 2);
  positions[5] = slot(4, 1, 2);
  positions[6] = slot(5, 1, 2);
  positions[7] = slot(7, 1, 2);
  positions[8] = slot(8, 1, 2);

  positions[9] = slot(0.5, 2, 3);
  positions[10] = slot(1.5, 2, 3.01);
  positions[11] = slot(2.5, 2, 3.02);
  positions[12] = slot(3.5, 2, 3.03);
  positions[13] = slot(4.5, 2, 3.04);
  positions[14] = slot(5.5, 2, 3.05);
  positions[15] = slot(6.5, 2, 3.06);
  positions[16] = slot(7.5, 2, 3.07);
  positions[17] = slot(8.5, 2, 3.08);

  for (let i = 0; i < 10; i++) {
    positions[18 + i] = slot(i, 3, 4 + i * 0.01);
  }

  return positions;
}

export const TABLEAU_POSITIONS = buildTableauPositions();

/** Cards rest on the stone lip, overlapping the top of the dashboard. */
const PANEL_CARD_Y = STONE_PANEL_TOP - 52;

export const STOCK_POSITION: CardPosition = { x: 138, y: PANEL_CARD_Y, layer: 20 };
export const WASTE_POSITION: CardPosition = {
  x: 138 + CARD_WIDTH + 14,
  y: PANEL_CARD_Y,
  layer: 21,
};
export const FOUNDATION_POSITION: CardPosition = {
  x: 138 + (CARD_WIDTH + 14) * 2,
  y: PANEL_CARD_Y,
  layer: 20,
};

export const PEAK_INDICES = [0, 1, 2] as const;

export const BOARD_ASPECT = BOARD_WIDTH / BOARD_HEIGHT;

function pct(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

export const STOCK_HIT_STYLE = {
  left: pct(STOCK_POSITION.x, BOARD_WIDTH),
  top: pct(STOCK_POSITION.y, BOARD_HEIGHT),
  width: pct(CARD_WIDTH, BOARD_WIDTH),
  height: pct(CARD_HEIGHT, BOARD_HEIGHT),
} as const;

export const STONE_PANEL_STYLE = {
  height: pct(STONE_PANEL_HEIGHT, BOARD_HEIGHT),
} as const;
