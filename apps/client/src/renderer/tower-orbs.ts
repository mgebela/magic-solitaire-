import { Container, Graphics } from 'pixi.js';
import { PEAK_INDICES, TABLEAU_POSITIONS } from './layout-positions';
import { CARD_WIDTH } from './constants';

/** Glowing green orbs atop each of the three tower peaks. */
export function drawTowerOrbs(): Container {
  const orbs = new Container();

  for (const index of PEAK_INDICES) {
    const pos = TABLEAU_POSITIONS[index];
    const cx = pos.x + CARD_WIDTH / 2;
    const cy = pos.y - 16;

    const pedestal = new Graphics();
    pedestal.roundRect(cx - 14, cy - 2, 28, 10, 4);
    pedestal.fill({ color: 0x5a5a5a });
    pedestal.stroke({ color: 0x3a3a3a, width: 1 });
    orbs.addChild(pedestal);

    const glow = new Graphics();
    glow.circle(cx, cy - 10, 13);
    glow.fill({ color: 0x44ff66, alpha: 0.3 });
    orbs.addChild(glow);

    const orb = new Graphics();
    orb.circle(cx, cy - 10, 8);
    orb.fill({ color: 0x22cc44 });
    orb.circle(cx - 2, cy - 13, 2.5);
    orb.fill({ color: 0x99ffaa, alpha: 0.8 });
    orbs.addChild(orb);
  }

  return orbs;
}
