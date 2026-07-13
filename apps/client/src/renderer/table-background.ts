import { Container, Graphics } from 'pixi.js';
import { BOARD_HEIGHT, BOARD_WIDTH, STONE_PANEL_TOP } from './layout-positions';

function drawBush(g: Graphics, x: number, y: number, scale = 1): void {
  for (let i = 0; i < 6; i++) {
    g.ellipse(x + i * 8 * scale, y - i * 2, 18 * scale - i * 2, 12 * scale);
    g.fill({ color: 0x2d7a28, alpha: 0.85 });
  }
  g.ellipse(x + 20 * scale, y - 4, 14 * scale, 10 * scale);
  g.fill({ color: 0x3d9a35, alpha: 0.7 });
}

function drawPalmFrond(g: Graphics, x: number, y: number, flip = false): void {
  const dir = flip ? -1 : 1;
  for (let i = 0; i < 5; i++) {
    g.moveTo(x, y);
    g.quadraticCurveTo(x + dir * (30 + i * 8), y - 20 - i * 6, x + dir * (55 + i * 10), y - 8 - i * 4);
    g.stroke({ color: 0x2a6e22, width: 5 - i * 0.5, alpha: 0.9 });
  }
}

function drawTorch(g: Graphics, x: number, y: number): void {
  g.roundRect(x - 5, y, 10, 36, 3);
  g.fill({ color: 0x5a4a32 });
  g.ellipse(x, y - 4, 10, 14);
  g.fill({ color: 0xff9922, alpha: 0.9 });
  g.ellipse(x, y - 10, 6, 10);
  g.fill({ color: 0xffee55, alpha: 0.85 });
}

/** Jungle grass playfield — stone dashboard is rendered in HTML HUD. */
export function drawMagicTableBackground(): Container {
  const root = new Container();

  const grass = new Graphics();
  grass.rect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  grass.fill({ color: 0x4a9a42 });

  for (let y = 0; y < BOARD_HEIGHT; y += 16) {
    grass.rect(0, y, BOARD_WIDTH, 8);
    grass.fill({ color: y % 32 === 0 ? 0x3d8a38 : 0x52a84c, alpha: 0.28 });
  }

  const accents = new Graphics();
  for (let i = 0; i < 36; i++) {
    const x = (i * 113 + 29) % (BOARD_WIDTH - 60) + 30;
    const y = (i * 71 + 11) % (STONE_PANEL_TOP - 80) + 40;
    accents.circle(x, y, 2);
    accents.fill({ color: i % 4 === 0 ? 0xffee88 : 0xffffff, alpha: 0.75 });
  }
  root.addChild(grass, accents);

  const foliage = new Graphics();
  drawBush(foliage, 8, STONE_PANEL_TOP - 30, 1.1);
  drawBush(foliage, BOARD_WIDTH - 90, STONE_PANEL_TOP - 25, 1);
  drawBush(foliage, 12, 120, 0.9);
  drawBush(foliage, BOARD_WIDTH - 75, 100, 0.85);
  drawPalmFrond(foliage, 20, 200, false);
  drawPalmFrond(foliage, BOARD_WIDTH - 20, 180, true);
  drawPalmFrond(foliage, 40, STONE_PANEL_TOP - 60, false);
  drawPalmFrond(foliage, BOARD_WIDTH - 45, STONE_PANEL_TOP - 55, true);

  drawTorch(foliage, 52, STONE_PANEL_TOP - 8);
  drawTorch(foliage, BOARD_WIDTH - 52, STONE_PANEL_TOP - 8);

  root.addChild(foliage);

  return root;
}
