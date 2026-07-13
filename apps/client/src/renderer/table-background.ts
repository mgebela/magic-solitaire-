import { Container, Graphics } from 'pixi.js';
import { BOARD_HEIGHT, BOARD_WIDTH, STONE_PANEL_TOP } from './layout-positions';

/** Grass field with flowers, chain frame, and stone control panel. */
export function drawMagicTableBackground(): Container {
  const root = new Container();

  const grass = new Graphics();
  grass.rect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  grass.fill({ color: 0x3d8f3a });

  // Grass variation bands
  for (let y = 0; y < BOARD_HEIGHT; y += 18) {
    grass.rect(0, y, BOARD_WIDTH, 9);
    grass.fill({ color: y % 36 === 0 ? 0x358535 : 0x429642, alpha: 0.35 });
  }

  // Wildflowers
  const flowerColors = [0xf5e642, 0xffffff, 0xffb3c6, 0xc8e878];
  for (let i = 0; i < 48; i++) {
    const x = (i * 137 + 41) % (BOARD_WIDTH - 40) + 20;
    const y = (i * 89 + 17) % (STONE_PANEL_TOP - 60) + 30;
    if (y > STONE_PANEL_TOP - 80) continue;
    grass.circle(x, y, 2.5);
    grass.fill({ color: flowerColors[i % flowerColors.length], alpha: 0.85 });
    grass.circle(x, y + 4, 1.5);
    grass.fill({ color: 0x2d6b2a, alpha: 0.6 });
  }

  // Leafy plants at edges
  for (const [bx, by] of [
    [30, STONE_PANEL_TOP - 50],
    [BOARD_WIDTH - 50, STONE_PANEL_TOP - 45],
    [BOARD_WIDTH / 2 - 120, STONE_PANEL_TOP - 35],
    [BOARD_WIDTH / 2 + 100, STONE_PANEL_TOP - 40],
  ]) {
    for (let l = 0; l < 5; l++) {
      grass.ellipse(bx + l * 6, by - l * 3, 14 - l * 2, 8);
      grass.fill({ color: 0x2a6e28, alpha: 0.7 });
    }
  }

  root.addChild(grass);

  // Silver chain corners
  const chains = new Graphics();
  const chainColor = 0xb8bcc4;
  const chainHighlight = 0xe8eaee;
  const corners: Array<[number, number, number, number]> = [
    [0, 0, 1, 1],
    [BOARD_WIDTH, 0, -1, 1],
    [0, STONE_PANEL_TOP, 1, -1],
    [BOARD_WIDTH, STONE_PANEL_TOP, -1, -1],
  ];

  for (const [cx, cy, sx, sy] of corners) {
    for (let i = 0; i < 8; i++) {
      const ox = cx + sx * (20 + i * 14);
      const oy = cy + sy * (16 + i * 12);
      chains.circle(ox, oy, 5);
      chains.stroke({ color: chainColor, width: 2.5 });
      chains.circle(ox - sx * 2, oy - sy * 2, 2);
      chains.fill({ color: chainHighlight, alpha: 0.6 });
    }
  }
  root.addChild(chains);

  // Stone control panel
  const panel = new Graphics();
  const panelH = BOARD_HEIGHT - STONE_PANEL_TOP;
  panel.roundRect(24, STONE_PANEL_TOP + 4, BOARD_WIDTH - 48, panelH - 12, 28);
  panel.fill({ color: 0x5a5a5a });

  // Stone texture
  for (let y = STONE_PANEL_TOP + 12; y < BOARD_HEIGHT - 8; y += 10) {
    for (let x = 36; x < BOARD_WIDTH - 36; x += 12) {
      if ((x * 3 + y * 7) % 17 === 0) {
        panel.circle(x, y, 1.2);
        panel.fill({ color: 0x000000, alpha: 0.12 });
      }
      if ((x * 5 + y * 11) % 23 === 0) {
        panel.circle(x + 3, y + 2, 0.8);
        panel.fill({ color: 0xffffff, alpha: 0.08 });
      }
    }
  }

  panel.roundRect(26, STONE_PANEL_TOP + 6, BOARD_WIDTH - 52, panelH - 16, 26);
  panel.stroke({ color: 0x3a3a3a, width: 3 });
  panel.roundRect(28, STONE_PANEL_TOP + 8, BOARD_WIDTH - 56, panelH - 20, 24);
  panel.stroke({ color: 0x7a7a7a, width: 1, alpha: 0.5 });

  root.addChild(panel);

  return root;
}
