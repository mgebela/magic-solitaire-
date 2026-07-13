import { Container, Graphics } from 'pixi.js';
import { TABLEAU_POSITIONS } from './layout-positions';
import { CARD_WIDTH } from './constants';

/** Glowing green orbs atop each of the three tower peaks. */
export function drawTowerOrbs(): Container {
  const orbs = new Container();
  const peakIndices = [0, 1, 2];

  for (const index of peakIndices) {
    const pos = TABLEAU_POSITIONS[index];
    const cx = pos.x + CARD_WIDTH / 2;
    const cy = pos.y - 18;

    const pedestal = new Graphics();
    pedestal.roundRect(cx - 14, cy - 4, 28, 12, 4);
    pedestal.fill({ color: 0x6a6a6a });
    pedestal.stroke({ color: 0x4a4a4a, width: 1 });
    orbs.addChild(pedestal);

    const glow = new Graphics();
    glow.circle(cx, cy - 10, 14);
    glow.fill({ color: 0x44ff66, alpha: 0.25 });
    orbs.addChild(glow);

    const orb = new Graphics();
    orb.circle(cx, cy - 10, 9);
    orb.fill({ color: 0x22cc44 });
    orb.circle(cx - 3, cy - 13, 3);
    orb.fill({ color: 0x88ffaa, alpha: 0.7 });
    orbs.addChild(orb);
  }

  return orbs;
}
