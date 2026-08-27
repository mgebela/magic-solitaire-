import { Container, Graphics } from 'pixi.js';
import { PEAK_INDICES, TABLEAU_POSITIONS } from './layout-positions';
import { CARD_WIDTH } from './constants';

/** Stepped stone shrine with a glowing green core above each peak. */
export function drawTowerOrbs(): Container {
  const orbs = new Container();

  for (const index of PEAK_INDICES) {
    const pos = TABLEAU_POSITIONS[index];
    const cx = pos.x + CARD_WIDTH / 2;
    const cy = pos.y + 4;

    const bloom = new Graphics();
    bloom.circle(cx, cy - 54, 48);
    bloom.fill({ color: 0x33ff66, alpha: 0.22 });
    orbs.addChild(bloom);

    const stone = new Graphics();
    stone.roundRect(cx - 38, cy - 28, 76, 22, 4);
    stone.fill({ color: 0x5a5a5a });
    stone.roundRect(cx - 28, cy - 46, 56, 20, 4);
    stone.fill({ color: 0x4e4e4e });
    stone.roundRect(cx - 22, cy - 72, 44, 28, 5);
    stone.fill({ color: 0x3f3f3f });
    stone.stroke({ color: 0x222222, width: 2 });
    orbs.addChild(stone);

    const cage = new Graphics();
    cage.roundRect(cx - 18, cy - 68, 36, 24, 3);
    cage.stroke({ color: 0xc8c8c8, width: 1.6, alpha: 0.7 });
    cage.moveTo(cx - 14, cy - 64);
    cage.lineTo(cx - 4, cy - 50);
    cage.moveTo(cx + 14, cy - 64);
    cage.lineTo(cx + 4, cy - 50);
    cage.moveTo(cx, cy - 68);
    cage.lineTo(cx, cy - 48);
    cage.stroke({ color: 0xe8e8e8, width: 1.3, alpha: 0.65 });
    orbs.addChild(cage);

    const well = new Graphics();
    well.roundRect(cx - 12, cy - 62, 24, 16, 2);
    well.fill({ color: 0x101010 });
    orbs.addChild(well);

    const glow = new Graphics();
    glow.circle(cx, cy - 54, 16);
    glow.fill({ color: 0x55ff77, alpha: 0.5 });
    orbs.addChild(glow);

    const light = new Graphics();
    light.circle(cx, cy - 54, 10);
    light.fill({ color: 0x2cff55 });
    light.circle(cx - 2.5, cy - 57, 3.2);
    light.fill({ color: 0xdcffd4, alpha: 0.95 });
    orbs.addChild(light);
  }

  return orbs;
}
