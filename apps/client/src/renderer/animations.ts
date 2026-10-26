export type EaseFn = (t: number) => number;

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export interface Tween {
  update: (dt: number) => boolean;
}

export function tween(
  durationMs: number,
  onUpdate: (progress: number, raw: number) => void,
  onComplete?: () => void,
  ease: EaseFn = easeOutCubic,
): Tween {
  let elapsed = 0;
  let finished = false;
  return {
    update(dt: number) {
      if (finished) return false;
      elapsed += dt;
      const raw = Math.min(Math.max(elapsed / durationMs, 0), 1);
      try {
        onUpdate(ease(raw), raw);
      } catch {
        finished = true;
        return false;
      }
      if (raw >= 1) {
        finished = true;
        try {
          onComplete?.();
        } catch {
          // ignore
        }
        return false;
      }
      return true;
    },
  };
}

export class TweenManager {
  private tweens: Tween[] = [];

  add(tweenInstance: Tween): void {
    this.tweens.push(tweenInstance);
  }

  update(dtMs: number): void {
    this.tweens = this.tweens.filter((t) => t.update(dtMs));
  }

  clear(): void {
    this.tweens = [];
  }
}
