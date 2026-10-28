import { Container, Graphics } from 'pixi.js';
import { CARD_HEIGHT, CARD_WIDTH } from './constants';
import { BOARD_HEIGHT, BOARD_WIDTH, PEAK_INDICES, TABLEAU_POSITIONS, WASTE_POSITION } from './layout-positions';
import { tween, type TweenManager } from './animations';

const GOLD = 0xd6ef4a;
const AMBER = 0xffc14a;
const NEON = 0x3dff55;

/**
 * One-shot clear: the peaks and the waste throw a gold burst.
 * The YOU WIN stamp is the HUD overlay, so it stays readable over the moss.
 */
export class WinCelebration {
  private roots: Container[] = [];

  play(layer: Container, tweens: TweenManager): void {
    this.clear();
    layer.sortableChildren = true;

    this.flash(layer, tweens);

    for (const index of PEAK_INDICES) {
      const pos = TABLEAU_POSITIONS[index];
      this.burst(layer, tweens, pos.x + CARD_WIDTH / 2, pos.y + 8, 16);
    }
    this.burst(
      layer,
      tweens,
      WASTE_POSITION.x + CARD_WIDTH / 2,
      WASTE_POSITION.y + CARD_HEIGHT / 2,
      12,
    );
  }

  clear(): void {
    for (const root of this.roots) {
      if (!root.destroyed) root.destroy({ children: true });
    }
    this.roots = [];
  }

  private track(root: Container): void {
    this.roots.push(root);
  }

  private flash(layer: Container, tweens: TweenManager): void {
    const wash = new Graphics();
    wash.rect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    wash.fill({ color: GOLD, alpha: 1 });
    wash.alpha = 0;
    wash.zIndex = 240;
    layer.addChild(wash);
    this.track(wash);

    tweens.add(
      tween(
        520,
        (_t, raw) => {
          if (wash.destroyed) return;
          wash.alpha = raw < 0.18 ? (raw / 0.18) * 0.38 : 0.38 * (1 - (raw - 0.18) / 0.82);
        },
        () => {
          if (!wash.destroyed) {
            layer.removeChild(wash);
            wash.destroy();
          }
        },
      ),
    );
  }

  private burst(
    layer: Container,
    tweens: TweenManager,
    x: number,
    y: number,
    count: number,
  ): void {
    const root = new Container();
    root.position.set(x, y);
    root.zIndex = 260;
    layer.addChild(root);
    this.track(root);

    const ring = new Graphics();
    ring.circle(0, 0, 18);
    ring.stroke({ color: GOLD, width: 4, alpha: 0.9 });
    root.addChild(ring);

    const sparks = Array.from({ length: count }, (_, i) => {
      const spark = new Graphics();
      const gold = i % 3 !== 2;
      spark.circle(0, 0, gold ? 3.2 : 2.2);
      spark.fill({ color: i % 2 === 0 ? GOLD : i % 3 === 0 ? AMBER : NEON });
      root.addChild(spark);
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      return { spark, angle, dist: 46 + (i % 5) * 16 };
    });

    tweens.add(
      tween(
        1100,
        (_t, raw) => {
          if (root.destroyed) return;
          const expand = Math.min(raw * 1.35, 1);
          ring.scale.set(0.4 + expand * 3.4);
          ring.alpha = raw < 0.2 ? 1 : Math.max(0, 1 - (raw - 0.2) / 0.55);

          for (const { spark, angle, dist } of sparks) {
            if (spark.destroyed) continue;
            spark.x = Math.cos(angle) * dist * expand;
            spark.y = Math.sin(angle) * dist * expand * 0.72 - 28 * raw;
            spark.alpha = raw < 0.45 ? 1 : Math.max(0, 1 - (raw - 0.45) / 0.55);
            spark.scale.set(1 - raw * 0.45);
          }
        },
        () => {
          if (!root.destroyed) {
            layer.removeChild(root);
            root.destroy({ children: true });
          }
        },
      ),
    );
  }
}
