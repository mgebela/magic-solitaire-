import { Container, Graphics } from 'pixi.js';
import { PEAK_INDICES, TABLEAU_POSITIONS } from './layout-positions';
import { CARD_WIDTH } from './constants';

/** Square tech-shrine caps with a glowing green core above each peak. */
export function drawTowerOrbs(): Container {
  const orbs = new Container();

  for (const index of PEAK_INDICES) {
    const pos = TABLEAU_POSITIONS[index];
    const cx = pos.x + CARD_WIDTH / 2;
    const cy = pos.y - 6;

    const bloom = new Graphics();
    bloom.circle(cx, cy - 28, 34);
    bloom.fill({ color: 0x33ff66, alpha: 0.16 });
    orbs.addChild(bloom);

    const cap = new Graphics();
    cap.roundRect(cx - 28, cy - 42, 56, 36, 6);
    cap.fill({ color: 0x6a6a6a });
    cap.roundRect(cx - 24, cy - 38, 48, 28, 4);
    cap.fill({ color: 0x4a4a4a });
    cap.roundRect(cx - 28, cy - 42, 56, 36, 6);
    cap.stroke({ color: 0x2a2a2a, width: 2 });

    cap.moveTo(cx - 18, cy - 34);
    cap.lineTo(cx - 8, cy - 18);
    cap.moveTo(cx + 18, cy - 34);
    cap.lineTo(cx + 8, cy - 18);
    cap.moveTo(cx, cy - 38);
    cap.lineTo(cx, cy - 14);
    cap.stroke({ color: 0xd8d8d8, width: 1.2, alpha: 0.55 });
    orbs.addChild(cap);

    const well = new Graphics();
    well.roundRect(cx - 14, cy - 32, 28, 20, 3);
    well.fill({ color: 0x1a1a1a });
    orbs.addChild(well);

    const glow = new Graphics();
    glow.circle(cx, cy - 22, 14);
    glow.fill({ color: 0x55ff77, alpha: 0.45 });
    orbs.addChild(glow);

    const light = new Graphics();
    light.circle(cx, cy - 22, 9);
    light.fill({ color: 0x2cff55 });
    light.circle(cx - 2.5, cy - 25, 3);
    light.fill({ color: 0xdcffd4, alpha: 0.95 });
    orbs.addChild(light);
  }

  return orbs;
}
