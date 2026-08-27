export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export interface Tween {
  update: (dt: number) => boolean;
}

export function tween(
  durationMs: number,
  onUpdate: (progress: number) => void,
  onComplete?: () => void,
): Tween {
  let elapsed = 0;
  let finished = false;
  return {
    update(dt: number) {
      if (finished) return false;
      elapsed += dt;
      const t = Math.min(elapsed / durationMs, 1);
      try {
        onUpdate(easeOutCubic(t));
      } catch {
        finished = true;
        return false;
      }
      if (t >= 1) {
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
