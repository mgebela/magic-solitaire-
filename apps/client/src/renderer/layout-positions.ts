import { CARD_HEIGHT, CARD_WIDTH } from './constants';

export interface CardPosition {
  x: number;
  y: number;
  layer: number;
}

export const BOARD_WIDTH = 960;
export const BOARD_HEIGHT = 640;

/** Top of the stone dashboard — matches the photographic limestone lip (~74.5%). */
export const STONE_PANEL_TOP = 476;
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
  /** Sit the 10-card row on the moss, just above the limestone lip. */
  const bottomY = STONE_PANEL_TOP - CARD_HEIGHT - 18;

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

const DESKTOP_TABLEAU = TABLEAU_POSITIONS.map((pos) => ({ ...pos }));
const DESKTOP_STOCK = { x: 138, y: STONE_PANEL_TOP + 32, layer: 20 };
const DESKTOP_WASTE = {
  x: 138 + CARD_WIDTH + 36,
  y: STONE_PANEL_TOP + 32,
  layer: 21,
};
const DESKTOP_FOUNDATION = {
  x: 138 + (CARD_WIDTH + 14) * 2,
  y: STONE_PANEL_TOP + 32,
  layer: 20,
};

/** Height of the coordinate system the HUD percentages are measured against. */
export let layoutHeight = BOARD_HEIGHT;
/** Limestone lip in the current coordinate system. The photo is shifted to match. */
export let layoutStoneTop = STONE_PANEL_TOP;
/** Waste card scale for the current layout. Desktop stays at WASTE_SCALE. */
export let layoutWasteScale = 1.26;

function copyPos(target: CardPosition, source: CardPosition): void {
  target.x = source.x;
  target.y = source.y;
  target.layer = source.layer;
}

/** Restore the desktop 960×640 table. */
export function applyDesktopLayout(): void {
  layoutHeight = BOARD_HEIGHT;
  layoutStoneTop = STONE_PANEL_TOP;
  layoutWasteScale = WASTE_SCALE;
  DESKTOP_TABLEAU.forEach((pos, index) => copyPos(TABLEAU_POSITIONS[index], pos));
  copyPos(STOCK_POSITION, DESKTOP_STOCK);
  copyPos(WASTE_POSITION, DESKTOP_WASTE);
  copyPos(FOUNDATION_POSITION, DESKTOP_FOUNDATION);
}

/**
 * Pack the same table into a shorter board so a landscape phone can show
 * every card and the stone bar across the full screen. Cards keep their shape.
 */
export function applyWideLayout(boardHeight: number): void {
  const topPad = 6;
  const gap = 8;
  const minStep = 32;
  const stoneForStep = boardHeight - (topPad + minStep * 3 + CARD_HEIGHT + gap);
  const stoneHeight = Math.min(STONE_PANEL_HEIGHT, Math.max(132, stoneForStep));
  const stoneTop = boardHeight - stoneHeight;
  layoutHeight = boardHeight;
  layoutStoneTop = stoneTop;
  layoutWasteScale = stoneHeight >= 156 ? WASTE_SCALE : 1.08;

  const sideMargin = 16;
  const hStep = (BOARD_WIDTH - sideMargin * 2 - CARD_WIDTH) / 9;
  const bottomY = stoneTop - CARD_HEIGHT - gap;
  const vStep = Math.min(58, Math.max(18, (bottomY - topPad) / 3));

  const slot = (col: number, row: number, layer: number): CardPosition => ({
    x: sideMargin + col * hStep,
    y: bottomY - (3 - row) * vStep,
    layer,
  });

  const placed: CardPosition[] = new Array(28);
  placed[0] = slot(1.5, 0, 1);
  placed[1] = slot(4.5, 0, 1);
  placed[2] = slot(7.5, 0, 1);
  placed[3] = slot(1, 1, 2);
  placed[4] = slot(2, 1, 2);
  placed[5] = slot(4, 1, 2);
  placed[6] = slot(5, 1, 2);
  placed[7] = slot(7, 1, 2);
  placed[8] = slot(8, 1, 2);
  placed[9] = slot(0.5, 2, 3);
  placed[10] = slot(1.5, 2, 3.01);
  placed[11] = slot(2.5, 2, 3.02);
  placed[12] = slot(3.5, 2, 3.03);
  placed[13] = slot(4.5, 2, 3.04);
  placed[14] = slot(5.5, 2, 3.05);
  placed[15] = slot(6.5, 2, 3.06);
  placed[16] = slot(7.5, 2, 3.07);
  placed[17] = slot(8.5, 2, 3.08);
  for (let i = 0; i < 10; i++) placed[18 + i] = slot(i, 3, 4 + i * 0.01);
  placed.forEach((pos, index) => copyPos(TABLEAU_POSITIONS[index], pos));

  const stockX = sideMargin + hStep * 1.55;
  const stockY = stoneTop + (stoneHeight - CARD_HEIGHT) / 2;
  copyPos(STOCK_POSITION, { x: stockX, y: stockY, layer: 20 });
  copyPos(WASTE_POSITION, { x: stockX + CARD_WIDTH + 22, y: stockY, layer: 21 });
  copyPos(FOUNDATION_POSITION, {
    x: WASTE_POSITION.x + CARD_WIDTH + 16,
    y: stockY,
    layer: 20,
  });
}

/** Stock and waste sit on the limestone slab, not on the moss above it. */
const PANEL_CARD_Y = STONE_PANEL_TOP + 32;

/** Waste is the match target, so it draws larger than the peak cards. */
export const WASTE_SCALE = 1.26;

export const STOCK_POSITION: CardPosition = { x: 138, y: PANEL_CARD_Y, layer: 20 };
export const WASTE_POSITION: CardPosition = {
  x: 138 + CARD_WIDTH + 36,
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

const wasteVisualLeft =
  WASTE_POSITION.x + CARD_WIDTH / 2 - (CARD_WIDTH * WASTE_SCALE) / 2;
const wasteVisualTop =
  WASTE_POSITION.y + CARD_HEIGHT / 2 - (CARD_HEIGHT * WASTE_SCALE) / 2;

export const WASTE_BADGE_STYLE = {
  left: pct(wasteVisualLeft + CARD_WIDTH * WASTE_SCALE - 6, BOARD_WIDTH),
  top: pct(wasteVisualTop + 8, BOARD_HEIGHT),
} as const;

export const STONE_PANEL_STYLE = {
  height: pct(STONE_PANEL_HEIGHT, BOARD_HEIGHT),
} as const;

/** Stock hit and waste badge, as percentages of the current board. */
export function overlayPercents(): {
  stockLeft: string;
  stockTop: string;
  stockW: string;
  stockH: string;
  wasteLeft: string;
  wasteTop: string;
} {
  const scale = layoutWasteScale;
  const wasteVisualLeft = WASTE_POSITION.x + CARD_WIDTH / 2 - (CARD_WIDTH * scale) / 2;
  const wasteVisualTop = WASTE_POSITION.y + CARD_HEIGHT / 2 - (CARD_HEIGHT * scale) / 2;
  return {
    stockLeft: pct(STOCK_POSITION.x, BOARD_WIDTH),
    stockTop: pct(STOCK_POSITION.y, layoutHeight),
    stockW: pct(CARD_WIDTH, BOARD_WIDTH),
    stockH: pct(CARD_HEIGHT, layoutHeight),
    wasteLeft: pct(wasteVisualLeft + CARD_WIDTH * scale - 6, BOARD_WIDTH),
    wasteTop: pct(wasteVisualTop + 8, layoutHeight),
  };
}
