import { Container, Graphics } from 'pixi.js';
import { BOARD_HEIGHT, BOARD_WIDTH, STONE_PANEL_TOP } from './layout-positions';

function drawBush(g: Graphics, x: number, y: number, scale = 1): void {
  for (let i = 0; i < 8; i++) {
    g.ellipse(x + i * 8 * scale, y - i * 2.4, 20 * scale - i * 1.5, 14 * scale);
    g.fill({ color: i % 2 === 0 ? 0x1e6a24 : 0x164e1c, alpha: 0.92 });
  }
  g.ellipse(x + 22 * scale, y - 8, 16 * scale, 12 * scale);
  g.fill({ color: 0x2f8a32, alpha: 0.8 });
  g.ellipse(x + 8 * scale, y - 12, 10 * scale, 8 * scale);
  g.fill({ color: 0x3daa3a, alpha: 0.55 });
}

function drawPalmFrond(g: Graphics, x: number, y: number, flip = false, scale = 1): void {
  const dir = flip ? -1 : 1;
  for (let i = 0; i < 7; i++) {
    g.moveTo(x, y);
    g.quadraticCurveTo(
      x + dir * (36 + i * 10) * scale,
      y - (22 + i * 8) * scale,
      x + dir * (64 + i * 14) * scale,
      y - (4 + i * 6) * scale,
    );
    g.stroke({
      color: i % 2 === 0 ? 0x1c5c20 : 0x2a7a28,
      width: (7 - i * 0.5) * scale,
      alpha: 0.94,
    });
  }
}

function drawTorch(g: Graphics, x: number, y: number): void {
  g.roundRect(x - 6, y, 12, 40, 3);
  g.fill({ color: 0x5a4a32 });
  g.roundRect(x - 8, y + 32, 16, 10, 2);
  g.fill({ color: 0x3d3224 });
  g.ellipse(x, y - 6, 13, 18);
  g.fill({ color: 0xff9922, alpha: 0.92 });
  g.ellipse(x, y - 16, 7, 12);
  g.fill({ color: 0xffee55, alpha: 0.9 });
}

function drawChainLink(g: Graphics, x: number, y: number, scale = 1): void {
  g.ellipse(x, y, 14 * scale, 9 * scale);
  g.stroke({ color: 0x9a9a9a, width: 6 * scale });
  g.ellipse(x, y, 14 * scale, 9 * scale);
  g.stroke({ color: 0x2a2a2a, width: 2.2 * scale });
}

function drawCornerChains(g: Graphics): void {
  for (let i = 0; i < 9; i++) {
    drawChainLink(g, 20 + i * 14, 18 + i * 12, 1.1);
    drawChainLink(g, BOARD_WIDTH - 20 - i * 14, 18 + i * 12, 1.1);
  }
}

function drawStonePanel(g: Graphics): void {
  const x = 10;
  const y = STONE_PANEL_TOP;
  const w = BOARD_WIDTH - 20;
  const h = BOARD_HEIGHT - STONE_PANEL_TOP + 20;

  g.roundRect(x + 5, y + 10, w, h, 30);
  g.fill({ color: 0x111111, alpha: 0.5 });

  g.roundRect(x, y, w, h, 30);
  g.fill({ color: 0x6a6a6a });
  g.roundRect(x + 8, y + 8, w - 16, h - 16, 24);
  g.fill({ color: 0x575757 });
  g.roundRect(x + 12, y + 12, w - 24, 22, 12);
  g.fill({ color: 0x8d8d8d, alpha: 0.28 });

  g.roundRect(x, y, w, h, 30);
  g.stroke({ color: 0x2a2a2a, width: 5 });

  for (let i = 0; i < 28; i++) {
    const cx = x + 36 + ((i * 73) % (w - 70));
    const cy = y + 22 + ((i * 47) % (h - 40));
    g.circle(cx, cy, 1 + (i % 3));
    g.fill({ color: 0x3a3a3a, alpha: 0.4 });
  }

  g.moveTo(x + 90, y + 20);
  g.lineTo(x + 160, y + 78);
  g.lineTo(x + 120, y + h - 24);
  g.stroke({ color: 0x3a3a3a, width: 2, alpha: 0.5 });
}

function drawMossField(g: Graphics): void {
  g.rect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  g.fill({ color: 0x246028 });

  for (let i = 0; i < 90; i++) {
    const x = ((i * 127) + 19) % BOARD_WIDTH;
    const y = ((i * 89) + 33) % STONE_PANEL_TOP;
    const rx = 28 + (i % 7) * 8;
    const ry = 16 + (i % 5) * 6;
    g.ellipse(x, y, rx, ry);
    g.fill({ color: i % 3 === 0 ? 0x1c4e20 : i % 3 === 1 ? 0x2f7a32 : 0x1a3d18, alpha: 0.45 });
  }

  for (let i = 0; i < 70; i++) {
    const x = ((i * 151) + 41) % (BOARD_WIDTH - 20) + 10;
    const y = ((i * 97) + 17) % (STONE_PANEL_TOP - 20) + 10;
    g.circle(x, y, i % 4 === 0 ? 4 : 2.2);
    g.fill({ color: i % 5 === 0 ? 0x4cbc48 : 0x163c16, alpha: i % 5 === 0 ? 0.35 : 0.5 });
  }
}

/** Jungle moss playfield with stone dashboard, chains, and foliage. */
export function drawMagicTableBackground(): Container {
  const root = new Container();

  const grass = new Graphics();
  drawMossField(grass);
  root.addChild(grass);

  const chains = new Graphics();
  drawCornerChains(chains);
  root.addChild(chains);

  const stone = new Graphics();
  drawStonePanel(stone);
  root.addChild(stone);

  const foliage = new Graphics();
  drawBush(foliage, 4, 90, 1.25);
  drawBush(foliage, BOARD_WIDTH - 110, 78, 1.2);
  drawBush(foliage, 4, STONE_PANEL_TOP - 10, 1.35);
  drawBush(foliage, BOARD_WIDTH - 118, STONE_PANEL_TOP - 8, 1.3);

  drawPalmFrond(foliage, 0, 150, false, 1.15);
  drawPalmFrond(foliage, BOARD_WIDTH, 130, true, 1.15);
  drawPalmFrond(foliage, 20, STONE_PANEL_TOP + 4, false, 1.05);
  drawPalmFrond(foliage, BOARD_WIDTH - 20, STONE_PANEL_TOP + 6, true, 1.05);

  drawTorch(foliage, 40, STONE_PANEL_TOP + 6);
  drawTorch(foliage, BOARD_WIDTH - 40, STONE_PANEL_TOP + 6);

  root.addChild(foliage);

  return root;
}
