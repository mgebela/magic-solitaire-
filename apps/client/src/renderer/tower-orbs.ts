import { Container, Graphics } from 'pixi.js';
import { PEAK_INDICES, TABLEAU_POSITIONS } from './layout-positions';
import { CARD_WIDTH } from './constants';

/** Stone temple caps with glowing green light atop each peak. */
export function drawTowerOrbs(): Container {
  const orbs = new Container();

  for (const index of PEAK_INDICES) {
    const pos = TABLEAU_POSITIONS[index];
    const cx = pos.x + CARD_WIDTH / 2;
    const cy = pos.y - 8;

    const cap = new Graphics();
    cap.roundRect(cx - 22, cy - 22, 44, 18, 5);
    cap.fill({ color: 0x6a6a6a });
    cap.roundRect(cx - 18, cy - 20, 36, 14, 4);
    cap.fill({ color: 0x5a5a5a });
    cap.stroke({ color: 0x3d3d3d, width: 1 });
    orbs.addChild(cap);

    const glow = new Graphics();
    glow.circle(cx, cy - 26, 16);
    glow.fill({ color: 0x55ff77, alpha: 0.35 });
    orbs.addChild(glow);

    const light = new Graphics();
    light.circle(cx, cy - 26, 10);
    light.fill({ color: 0x33dd55 });
    light.circle(cx - 3, cy - 29, 3);
    light.fill({ color: 0xbbffcc, alpha: 0.9 });
    orbs.addChild(light);
  }

  return orbs;
}
