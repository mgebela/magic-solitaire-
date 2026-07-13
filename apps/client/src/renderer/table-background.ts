import { Graphics } from 'pixi.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from './layout-positions';

/** Rich casino-style felt table with gold rail. */
export function drawTableBackground(): Graphics {
  const table = new Graphics();

  // Outer shadow
  table.roundRect(4, 6, BOARD_WIDTH - 8, BOARD_HEIGHT - 6, 20);
  table.fill({ color: 0x000000, alpha: 0.35 });

  // Wood rail
  table.roundRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT, 18);
  table.fill({ color: 0x5c3d1e });
  table.roundRect(3, 3, BOARD_WIDTH - 6, BOARD_HEIGHT - 6, 16);
  table.fill({ color: 0x8b6914 });

  // Felt surface
  table.roundRect(8, 8, BOARD_WIDTH - 16, BOARD_HEIGHT - 16, 14);
  table.fill({ color: 0x146b42 });

  // Inner felt highlight (radial-ish bands)
  for (let i = 0; i < 6; i++) {
    const alpha = 0.04 + i * 0.01;
    table.roundRect(12 + i * 4, 12 + i * 3, BOARD_WIDTH - 24 - i * 8, BOARD_HEIGHT - 24 - i * 6, 12);
    table.fill({ color: 0xffffff, alpha });
  }

  // Subtle felt texture dots
  for (let y = 20; y < BOARD_HEIGHT - 20; y += 14) {
    for (let x = 20; x < BOARD_WIDTH - 20; x += 14) {
      if ((x + y) % 28 === 0) {
        table.circle(x, y, 0.8);
        table.fill({ color: 0x000000, alpha: 0.06 });
      }
    }
  }

  // Gold inner line
  table.roundRect(10, 10, BOARD_WIDTH - 20, BOARD_HEIGHT - 20, 14);
  table.stroke({ color: 0xd4a843, width: 1, alpha: 0.35 });

  return table;
}
