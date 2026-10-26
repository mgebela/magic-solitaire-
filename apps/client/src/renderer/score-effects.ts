import { Container, Graphics, Text } from 'pixi.js';
import type { TweenManager } from './animations';
import { easeOutBack, tween } from './animations';

interface FloatingScore {
  root: Container;
}

function comboFill(combo: number): number {
  if (combo >= 5) return 0xffc14a;
  if (combo >= 3) return 0xffe066;
  if (combo >= 2) return 0xd6ef4a;
  return 0xf5ffe8;
}

export class ScoreEffectManager {
  private effects: FloatingScore[] = [];

  spawn(
    layer: Container,
    tweens: TweenManager,
    x: number,
    y: number,
    points: number,
    combo: number,
  ): void {
    const root = new Container();
    root.position.set(x, y - 8);
    root.zIndex = 300;
    layer.sortableChildren = true;
    layer.addChild(root);

    const fill = comboFill(combo);
    const size = combo >= 4 ? 42 : combo >= 2 ? 36 : 30;

    const pointsText = new Text({
      text: `+${points}`,
      style: {
        fontFamily: 'Anton, Impact, system-ui, sans-serif',
        fontSize: size,
        fontWeight: '400',
        fill,
        stroke: { color: 0x071208, width: 5 },
        dropShadow: {
          alpha: 0.7,
          blur: 8,
          color: combo >= 3 ? 0xffc14a : 0x3dff55,
          distance: 0,
        },
      },
    });
    pointsText.anchor.set(0.5);
    root.addChild(pointsText);

    if (combo >= 2) {
      const comboText = new Text({
        text: combo >= 4 ? `COMBO x${combo}` : `x${combo}`,
        style: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: combo >= 4 ? 14 : 13,
          fontWeight: '800',
          fill: 0xfff6c8,
          stroke: { color: 0x071208, width: 3 },
        },
      });
      comboText.anchor.set(0.5, 0);
      comboText.y = size * 0.42;
      root.addChild(comboText);
    }

    const sparkCount = combo >= 5 ? 12 : combo >= 3 ? 8 : combo >= 2 ? 5 : 3;
    const sparks = Array.from({ length: sparkCount }, (_, i) => {
      const spark = new Graphics();
      const radius = combo >= 3 ? 2.4 + (i % 3) : 1.8;
      spark.circle(0, 0, radius);
      spark.fill({ color: i % 2 === 0 ? fill : 0xffffff, alpha: 0.95 });
      root.addChild(spark);
      const angle = (Math.PI * 2 * i) / sparkCount - Math.PI / 2;
      return { spark, angle, dist: 18 + (i % 4) * 10 };
    });

    const effect = { root };
    this.effects.push(effect);
    const duration = combo >= 3 ? 1150 : 900;
    const rise = combo >= 3 ? 92 : 72;

    tweens.add(
      tween(
        duration,
        (t, raw) => {
          if (root.destroyed) return;
          const pop = raw < 0.22 ? easeOutBack(Math.min(raw / 0.22, 1)) : 1;
          const settle = raw < 0.22 ? 0.72 + pop * 0.48 : 1.08 - (raw - 0.22) * 0.08;
          root.scale.set(Math.max(0.2, settle));
          root.y = y - 8 - rise * t;
          root.alpha = raw < 0.55 ? 1 : 1 - (raw - 0.55) / 0.45;

          for (const { spark, angle, dist } of sparks) {
            if (spark.destroyed) continue;
            const burst = Math.min(raw * 1.8, 1);
            spark.x = Math.cos(angle) * dist * burst;
            spark.y = Math.sin(angle) * dist * burst * 0.72 - 6 * burst;
            spark.alpha = raw < 0.35 ? 1 : Math.max(0, 1 - (raw - 0.35) / 0.4);
            spark.scale.set(1 - raw * 0.65);
          }
        },
        () => {
          if (!root.destroyed) {
            layer.removeChild(root);
            root.destroy({ children: true });
          }
          this.effects = this.effects.filter((item) => item !== effect);
        },
      ),
    );
  }

  clear(): void {
    for (const effect of this.effects) {
      if (!effect.root.destroyed) {
        effect.root.destroy({ children: true });
      }
    }
    this.effects = [];
  }
}
