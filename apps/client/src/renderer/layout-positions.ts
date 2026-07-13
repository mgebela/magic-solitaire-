import { CARD_WIDTH } from './constants';

export interface CardPosition {
  x: number;
  y: number;
  layer: number;
}

const H_STEP = CARD_WIDTH * 0.44;
const V_STEP = 34;
const START_X = 100;
const START_Y = 70;

/** Screen positions for each of the 28 tableau indices (LAYOUT_VERSION 1). */
export function buildTableauPositions(): CardPosition[] {
  const positions: CardPosition[] = new Array(28);
  const peakCenters = [START_X + 3 * H_STEP, START_X + 9 * H_STEP, START_X + 15 * H_STEP];

  // Row 0 — peak tops
  positions[0] = slot(peakCenters[0], START_Y, 4);
  positions[1] = slot(peakCenters[1], START_Y, 4);
  positions[2] = slot(peakCenters[2], START_Y, 4);

  // Row 1
  for (let peak = 0; peak < 3; peak++) {
    const cx = peakCenters[peak];
    positions[3 + peak * 2] = slot(cx - H_STEP, START_Y + V_STEP, 3);
    positions[4 + peak * 2] = slot(cx + H_STEP, START_Y + V_STEP, 3);
  }

  // Row 2
  for (let peak = 0; peak < 3; peak++) {
    const cx = peakCenters[peak];
    for (let col = 0; col < 3; col++) {
      positions[9 + peak * 3 + col] = slot(cx + (col - 1) * H_STEP, START_Y + V_STEP * 2, 2);
    }
  }

  // Row 3
  for (let peak = 0; peak < 3; peak++) {
    const cx = peakCenters[peak];
    positions[18 + peak * 2] = slot(cx - H_STEP * 0.55, START_Y + V_STEP * 3, 1);
    positions[19 + peak * 2] = slot(cx + H_STEP * 0.55, START_Y + V_STEP * 3, 1);
  }

  // Row 4 — bottom
  positions[24] = slot(peakCenters[0], START_Y + V_STEP * 4, 0);
  positions[25] = slot(peakCenters[1], START_Y + V_STEP * 4, 0);
  positions[26] = slot(peakCenters[2] - H_STEP, START_Y + V_STEP * 4, 0);
  positions[27] = slot(peakCenters[2] + H_STEP, START_Y + V_STEP * 4, 0);

  return positions;
}

function slot(cx: number, y: number, layer: number): CardPosition {
  return { x: cx - CARD_WIDTH / 2, y, layer };
}

export const TABLEAU_POSITIONS = buildTableauPositions();

export const WASTE_POSITION: CardPosition = { x: 560, y: 360, layer: 10 };
export const STOCK_POSITION: CardPosition = { x: 660, y: 360, layer: 10 };
export const FOUNDATION_POSITION: CardPosition = { x: 460, y: 360, layer: 10 };

export const BOARD_WIDTH = 780;
export const BOARD_HEIGHT = 520;
