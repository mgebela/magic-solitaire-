import { Text } from 'pixi.js';
import type { TweenManager } from './animations';
import { tween } from './animations';

interface FloatingScore {
  text: Text;
  lifeMs: number;
}

export class ScoreEffectManager {
  private effects: FloatingScore[] = [];

  spawn(
    layer: { addChild: (child: Text) => void; removeChild: (child: Text) => void },
    tweens: TweenManager,
    x: number,
    y: number,
    points: number,
    combo: number,
  ): void {
    const label =
      combo > 1 ? `+${points} ×${combo}` : `+${points}`;

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: combo > 2 ? 22 : 18,
        fontWeight: 'bold',
        fill: combo > 2 ? 0xffd700 : 0xffffff,
        dropShadow: {
          alpha: 0.8,
          blur: 4,
          color: 0x000000,
          distance: 2,
        },
      },
    });

    text.anchor.set(0.5);
    text.position.set(x, y);
    layer.addChild(text);

    const effect = { text, lifeMs: 900 };
    this.effects.push(effect);

    const startY = y;
    tweens.add(
      tween(900, (t) => {
        text.y = startY - 48 * t;
        text.alpha = 1 - t;
        const pulse = 1 + Math.sin(t * Math.PI) * (combo > 1 ? 0.15 : 0.05);
        text.scale.set(pulse);
      }, () => {
        layer.removeChild(text);
        text.destroy();
        this.effects = this.effects.filter((e) => e !== effect);
      }),
    );
  }

  clear(): void {
    for (const effect of this.effects) {
      effect.text.destroy();
    }
    this.effects = [];
  }
}
