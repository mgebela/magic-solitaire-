import { CARD_HEIGHT, CARD_WIDTH } from './constants';

export interface CardPosition {
  x: number;
  y: number;
  layer: number;
}

export const BOARD_WIDTH = 960;
export const BOARD_HEIGHT = 640;
/** Top edge of the stone dashboard (HTML HUD covers below this). */
export const STONE_PANEL_TOP = 468;

/**
 * LAYOUT_VERSION 2 — classic TriPeaks, must match apps/game-engine/src/layout.ts
 *
 *        [0]         [1]         [2]
 *      [3] [4]     [5] [6]     [7] [8]
 *    [9][10][11] [12][13][14] [15][16][17]
 *  [18][19][20][21][22][23][24][25][26][27]
 *
 * Three separate peaks share a 10-card face-up base.
 * Higher `layer` = drawn in front (bottom row covers the cards above).
 */
export function buildTableauPositions(): CardPosition[] {
  const positions: CardPosition[] = new Array(28);

  const hStep = CARD_WIDTH * 0.62;
  const vStep = 36;
  const bottomWidth = 9 * hStep + CARD_WIDTH;
  const startX = (BOARD_WIDTH - bottomWidth) / 2;
  const bottomY = STONE_PANEL_TOP - CARD_HEIGHT - 16;

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

const PANEL_CARD_Y = STONE_PANEL_TOP + 42;

/** Stock bottom-left, waste immediately to its right (cardgames.io layout). */
export const STOCK_POSITION: CardPosition = { x: 52, y: PANEL_CARD_Y, layer: 20 };
export const WASTE_POSITION: CardPosition = { x: 52 + CARD_WIDTH + 14, y: PANEL_CARD_Y, layer: 21 };
export const FOUNDATION_POSITION: CardPosition = { x: 52 + (CARD_WIDTH + 14) * 2, y: PANEL_CARD_Y, layer: 20 };

export const PEAK_INDICES = [0, 1, 2] as const;

/** Board aspect ratio for HUD alignment. */
export const BOARD_ASPECT = BOARD_WIDTH / BOARD_HEIGHT;
