import { Container, Graphics } from 'pixi.js';
import { BOARD_HEIGHT, BOARD_WIDTH, STONE_PANEL_TOP } from './layout-positions';

function drawBush(g: Graphics, x: number, y: number, scale = 1): void {
  for (let i = 0; i < 7; i++) {
    g.ellipse(x + i * 7 * scale, y - i * 2.2, 16 * scale - i * 1.4, 11 * scale);
    g.fill({ color: i % 2 === 0 ? 0x2a7a28 : 0x1f6a22, alpha: 0.9 });
  }
  g.ellipse(x + 18 * scale, y - 6, 13 * scale, 10 * scale);
  g.fill({ color: 0x3d9a35, alpha: 0.78 });
}

function drawPalmFrond(g: Graphics, x: number, y: number, flip = false): void {
  const dir = flip ? -1 : 1;
  for (let i = 0; i < 6; i++) {
    g.moveTo(x, y);
    g.quadraticCurveTo(
      x + dir * (28 + i * 8),
      y - 18 - i * 7,
      x + dir * (52 + i * 11),
      y - 6 - i * 5,
    );
    g.stroke({ color: i % 2 === 0 ? 0x246b20 : 0x2f8628, width: 5.5 - i * 0.45, alpha: 0.92 });
  }
}

function drawTorch(g: Graphics, x: number, y: number): void {
  g.roundRect(x - 5, y, 10, 34, 3);
  g.fill({ color: 0x5a4a32 });
  g.roundRect(x - 7, y + 28, 14, 8, 2);
  g.fill({ color: 0x3d3224 });
  g.ellipse(x, y - 4, 11, 15);
  g.fill({ color: 0xff9922, alpha: 0.92 });
  g.ellipse(x, y - 12, 6, 10);
  g.fill({ color: 0xffee55, alpha: 0.9 });
}

function drawChainLink(g: Graphics, x: number, y: number, scale = 1): void {
  g.ellipse(x, y, 13 * scale, 8 * scale);
  g.stroke({ color: 0x8a8a8a, width: 5.5 * scale });
  g.ellipse(x, y, 13 * scale, 8 * scale);
  g.stroke({ color: 0x2f2f2f, width: 2 * scale });
}

function drawCornerChains(g: Graphics): void {
  const links = 7;
  for (let i = 0; i < links; i++) {
    drawChainLink(g, 18 + i * 13, 16 + i * 11, 1.05);
    drawChainLink(g, BOARD_WIDTH - 18 - i * 13, 16 + i * 11, 1.05);
    drawChainLink(g, 22 + i * 11, STONE_PANEL_TOP - 8 - i * 4, 0.95);
    drawChainLink(g, BOARD_WIDTH - 22 - i * 11, STONE_PANEL_TOP - 8 - i * 4, 0.95);
  }
}

function drawStonePanel(g: Graphics): void {
  const x = 14;
  const y = STONE_PANEL_TOP;
  const w = BOARD_WIDTH - 28;
  const h = BOARD_HEIGHT - STONE_PANEL_TOP + 18;

  g.roundRect(x + 4, y + 8, w, h, 28);
  g.fill({ color: 0x1a1a1a, alpha: 0.45 });

  g.roundRect(x, y, w, h, 28);
  g.fill({ color: 0x6e6e6e });
  g.roundRect(x + 6, y + 6, w - 12, h - 12, 22);
  g.fill({ color: 0x5a5a5a });
  g.roundRect(x + 10, y + 10, w - 20, 18, 10);
  g.fill({ color: 0x8a8a8a, alpha: 0.35 });

  g.roundRect(x, y, w, h, 28);
  g.stroke({ color: 0x2f2f2f, width: 4 });

  for (let i = 0; i < 14; i++) {
    const cx = x + 40 + ((i * 67) % (w - 80));
    const cy = y + 24 + ((i * 41) % (h - 50));
    g.circle(cx, cy, 1 + (i % 3));
    g.fill({ color: 0x3a3a3a, alpha: 0.35 });
  }

  g.moveTo(x + 80, y + 22);
  g.lineTo(x + 140, y + 70);
  g.lineTo(x + 110, y + h - 30);
  g.stroke({ color: 0x3d3d3d, width: 1.5, alpha: 0.45 });

  g.moveTo(x + w - 160, y + 18);
  g.lineTo(x + w - 90, y + 88);
  g.stroke({ color: 0x3d3d3d, width: 1.4, alpha: 0.4 });
}

/** Jungle grass playfield with stone dashboard, chains, and foliage. */
export function drawMagicTableBackground(): Container {
  const root = new Container();

  const grass = new Graphics();
  grass.rect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  grass.fill({ color: 0x3d8a38 });

  for (let y = 0; y < BOARD_HEIGHT; y += 14) {
    grass.rect(0, y, BOARD_WIDTH, 7);
    grass.fill({ color: y % 28 === 0 ? 0x327a30 : 0x4aa044, alpha: 0.32 });
  }

  const clover = new Graphics();
  for (let i = 0; i < 48; i++) {
    const x = (i * 113 + 29) % (BOARD_WIDTH - 50) + 25;
    const y = (i * 71 + 11) % (STONE_PANEL_TOP - 70) + 28;
    clover.circle(x, y, i % 5 === 0 ? 2.4 : 1.6);
    clover.fill({ color: i % 3 === 0 ? 0x6dff45 : 0x2d6a28, alpha: i % 3 === 0 ? 0.35 : 0.45 });
  }
  root.addChild(grass, clover);

  const chains = new Graphics();
  drawCornerChains(chains);
  root.addChild(chains);

  const stone = new Graphics();
  drawStonePanel(stone);
  root.addChild(stone);

  const foliage = new Graphics();
  drawBush(foliage, 6, 108, 1.05);
  drawBush(foliage, BOARD_WIDTH - 92, 92, 1);
  drawBush(foliage, 210, 48, 0.7);
  drawBush(foliage, 430, 36, 0.65);
  drawBush(foliage, 660, 44, 0.7);
  drawBush(foliage, 16, STONE_PANEL_TOP - 18, 1.15);
  drawBush(foliage, BOARD_WIDTH - 100, STONE_PANEL_TOP - 14, 1.1);

  drawPalmFrond(foliage, 8, 168, false);
  drawPalmFrond(foliage, BOARD_WIDTH - 8, 150, true);
  drawPalmFrond(foliage, 36, STONE_PANEL_TOP - 8, false);
  drawPalmFrond(foliage, BOARD_WIDTH - 36, STONE_PANEL_TOP - 6, true);

  drawTorch(foliage, 42, STONE_PANEL_TOP + 8);
  drawTorch(foliage, BOARD_WIDTH - 42, STONE_PANEL_TOP + 8);

  root.addChild(foliage);

  return root;
}
