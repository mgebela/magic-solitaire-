import { Container, Graphics, Text } from 'pixi.js';
import { CARD_WIDTH } from './constants';
import { TABLEAU_POSITIONS } from './layout-positions';
import { easeOutBack, tween, type TweenManager } from './animations';

const GOLD = 0xf0e6a8;
const NEON = 0xd6ef4a;
const AMBER = 0xffc14a;

/** Where the neon well sits, including the shrink used on a short landscape board. */
export function peakWell(index: number): { x: number; y: number } {
  const pos = TABLEAU_POSITIONS[index];
  const cx = pos.x + CARD_WIDTH / 2;
  const cy = pos.y - 66;
  if (pos.y < 80) {
    return { x: cx, y: 48 + (cy - pos.y) * 0.42 };
  }
  return { x: cx, y: cy };
}

/**
 * The moment one peak comes off: the well flares, a gold ring bursts,
 * and CLEARED stamps the tower that just fell.
 */
export class TowerClear {
  private roots: Container[] = [];

  play(layer: Container, tweens: TweenManager, index: number, glow: Container | null): void {
    const { x, y } = peakWell(index);
    layer.sortableChildren = true;

    const root = new Container();
    root.position.set(x, y);
    root.zIndex = 250;
    layer.addChild(root);
    this.roots.push(root);

    const ring = new Graphics();
    ring.circle(0, 0, 20);
    ring.stroke({ color: GOLD, width: 6, alpha: 1 });
    root.addChild(ring);

    const ring2 = new Graphics();
    ring2.circle(0, 0, 14);
    ring2.stroke({ color: NEON, width: 4, alpha: 0.95 });
    root.addChild(ring2);

    const sparks = Array.from({ length: 16 }, (_, i) => {
      const spark = new Graphics();
      spark.circle(0, 0, i % 3 === 0 ? 4.4 : 2.8);
      spark.fill({ color: i % 3 === 0 ? GOLD : i % 3 === 1 ? AMBER : NEON });
      root.addChild(spark);
      const angle = (Math.PI * 2 * i) / 16 - Math.PI / 2;
      return { spark, angle, dist: 58 + (i % 4) * 14 };
    });

    const plate = new Graphics();
    plate.roundRect(-78, -16, 156, 36, 8);
    plate.fill({ color: 0x14140f, alpha: 0.88 });
    plate.roundRect(-78, -16, 156, 36, 8);
    plate.stroke({ color: GOLD, width: 2, alpha: 0.95 });
    root.addChild(plate);

    const label = new Text({
      text: 'CLEARED',
      style: {
        fontFamily: 'Anton, Impact, system-ui, sans-serif',
        fontSize: 28,
        fill: GOLD,
        stroke: { color: 0x071208, width: 4 },
        letterSpacing: 2,
      },
    });
    label.anchor.set(0.5, 0.5);
    root.addChild(label);

    tweens.add(
      tween(
        1600,
        (_t, raw) => {
          if (root.destroyed) return;
          const expand = Math.min(raw * 1.6, 1);
          ring.scale.set(0.35 + expand * 2.8);
          ring.alpha = raw < 0.55 ? 1 : Math.max(0, 1 - (raw - 0.55) / 0.35);
          ring2.scale.set(0.25 + expand * 2.1);
          ring2.alpha = raw < 0.48 ? 0.95 : Math.max(0, 0.95 * (1 - (raw - 0.48) / 0.35));

          for (const { spark, angle, dist } of sparks) {
            if (spark.destroyed) continue;
            spark.x = Math.cos(angle) * dist * expand;
            spark.y = Math.sin(angle) * dist * expand * 0.72;
            spark.alpha = raw < 0.55 ? 1 : Math.max(0, 1 - (raw - 0.55) / 0.4);
          }

          const pop = raw < 0.22 ? easeOutBack(raw / 0.22) : 1;
          const stamp = pop;
          plate.scale.set(stamp);
          label.scale.set(stamp);
          plate.alpha = raw < 0.68 ? 1 : Math.max(0, 1 - (raw - 0.68) / 0.32);
          label.alpha = plate.alpha;

          if (glow && !glow.destroyed) {
            const flare = 1 + Math.sin(Math.min(raw, 1) * Math.PI) * 0.7;
            glow.scale.set(flare);
            glow.alpha = 1;
          }
        },
        () => {
          if (glow && !glow.destroyed) glow.scale.set(1);
          if (!root.destroyed) {
            layer.removeChild(root);
            root.destroy({ children: true });
          }
        },
      ),
    );
  }

  clear(): void {
    for (const root of this.roots) {
      if (!root.destroyed) root.destroy({ children: true });
    }
    this.roots = [];
  }
}
