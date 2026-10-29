import { Container, Graphics } from 'pixi.js';
import { PEAK_INDICES, TABLEAU_POSITIONS } from './layout-positions';
import { CARD_WIDTH } from './constants';

export interface PeakLights {
  root: Container;
  sync(cleared: readonly boolean[], lost: boolean): void;
}

/**
 * Stone ziggurats over the three peaks. The neon well stays dim until that peak clears.
 */
export function createPeakLights(): PeakLights {
  const root = new Container();
  const glows: Container[] = [];

  root.sortableChildren = true;

  for (const index of PEAK_INDICES) {
    const pos = TABLEAU_POSITIONS[index];
    const cx = pos.x + CARD_WIDTH / 2;
    const built = drawZiggurat(cx, pos.y);
    // A landscape board starts the peaks at the top edge, so shrink the orb onto the peak.
    if (pos.y < 80) {
      built.root.pivot.set(cx, pos.y);
      built.root.position.set(cx, 48);
      built.root.scale.set(0.42);
      built.root.zIndex = 2;
    }
    root.addChild(built.root);
    glows.push(built.glow);
  }

  return {
    root,
    sync(cleared, lost) {
      glows.forEach((glow, index) => {
        const lit = Boolean(cleared[index]) && !lost;
        glow.alpha = lost ? 0.08 : lit ? 1 : 0.28;
      });
    },
  };
}

function drawZiggurat(cx: number, peakY: number): { root: Container; glow: Container } {
  const root = new Container();
  const glow = new Container();
  const size = 90;
  const gap = 7;
  const pyramidBottom = peakY - gap;
  const cy = pyramidBottom - size / 2;

  const bloom = new Graphics();
  bloom.circle(cx, cy, 54);
  bloom.fill({ color: 0x2cff55, alpha: 0.15 });
  bloom.circle(cx, cy, 26);
  bloom.fill({ color: 0x6dff45, alpha: 0.2 });
  glow.addChild(bloom);

  const sideGlow = new Graphics();
  sideGlow.ellipse(cx - size / 2 - 1, pyramidBottom + 5, 4, 10);
  sideGlow.fill({ color: 0x3dff66, alpha: 0.9 });
  sideGlow.ellipse(cx + size / 2 + 1, pyramidBottom + 5, 4, 10);
  sideGlow.fill({ color: 0x3dff66, alpha: 0.9 });
  glow.addChild(sideGlow);

  addStoneSlab(root, cx - 52, peakY - 3, 104, 24);

  const bands = [
    { size: 90, fill: 0x6c6c6a, hole: 76 },
    { size: 76, fill: 0x5d5d5b, hole: 62 },
    { size: 62, fill: 0x50504e, hole: 48 },
    { size: 48, fill: 0x434341, hole: 34 },
    { size: 34, fill: 0x373735, hole: 22 },
  ];
  for (const band of bands) {
    addStepBand(root, cx, cy, band.size, band.hole, band.fill);
  }

  addLadders(root, cx, cy, 88, 44);

  const well = new Graphics();
  well.roundRect(cx - 11, cy - 11, 22, 22, 2);
  well.fill({ color: 0x141412 });
  well.roundRect(cx - 11, cy - 11, 22, 22, 2);
  well.stroke({ color: 0x0a0a08, width: 1.5 });
  root.addChild(well);

  const orbGlow = new Graphics();
  orbGlow.circle(cx, cy, 15);
  orbGlow.fill({ color: 0x33ff66, alpha: 0.42 });
  glow.addChild(orbGlow);

  const orb = new Graphics();
  orb.circle(cx, cy, 8.2);
  orb.fill({ color: 0x20ee52 });
  orb.circle(cx - 1.6, cy - 2, 3);
  orb.fill({ color: 0xf4ffe8, alpha: 0.96 });
  glow.addChild(orb);
  glow.alpha = 0.28;
  root.addChild(glow);

  return { root, glow };
}

function addStoneSlab(parent: Container, x: number, y: number, w: number, h: number): void {
  const slab = new Graphics();
  slab.roundRect(x, y, w, h, 3);
  slab.fill({ color: 0x5a5a58 });
  slab.roundRect(x, y, w, h, 3);
  slab.stroke({ color: 0x2c2c2a, width: 2 });
  slab.moveTo(x + 6, y + 2.5);
  slab.lineTo(x + w - 6, y + 2.5);
  slab.stroke({ color: 0x8a8a86, width: 1.2, alpha: 0.32 });
  parent.addChild(slab);

  const pits = new Graphics();
  for (let i = 0; i < 12; i++) {
    pits.circle(x + 8 + ((i * 19) % (w - 16)), y + 5 + ((i * 13) % (h - 10)), 1.1);
    pits.fill({ color: i % 2 ? 0x3a3a38 : 0x8a8a86, alpha: 0.38 });
  }
  parent.addChild(pits);
}

function addStepBand(
  parent: Container,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  fill: number,
): void {
  const x = cx - outer / 2;
  const y = cy - outer / 2;
  const ix = cx - inner / 2;
  const iy = cy - inner / 2;

  const g = new Graphics();
  g.roundRect(x, y, outer, outer, 3);
  g.fill({ color: fill });
  g.roundRect(ix, iy, inner, inner, 2);
  g.cut();
  g.roundRect(x, y, outer, outer, 3);
  g.stroke({ color: 0x2e2e2c, width: 1.5 });
  g.roundRect(ix, iy, inner, inner, 2);
  g.stroke({ color: 0x8c8c86, width: 1.1, alpha: 0.4 });
  parent.addChild(g);

  const grain = new Graphics();
  const band = (outer - inner) / 2;
  for (let i = 0; i < 8; i++) {
    const side = i % 4;
    const t = (Math.floor(i / 4) + 1) / 3;
    let px = cx;
    let py = cy;
    if (side === 0) {
      px = x + 8 + t * (outer - 16);
      py = y + band * 0.45;
    } else if (side === 1) {
      px = x + 8 + t * (outer - 16);
      py = y + outer - band * 0.45;
    } else if (side === 2) {
      px = x + band * 0.45;
      py = y + 8 + t * (outer - 16);
    } else {
      px = x + outer - band * 0.45;
      py = y + 8 + t * (outer - 16);
    }
    grain.circle(px, py, 1);
    grain.fill({ color: 0x7a7a76, alpha: 0.35 });
  }
  parent.addChild(grain);
}

function addLadders(parent: Container, cx: number, cy: number, outer: number, inner: number): void {
  const rungs = 6;
  const travel = (outer - inner) / 2 - 4;

  const north = new Graphics();
  const south = new Graphics();
  const west = new Graphics();
  const east = new Graphics();

  for (let i = 0; i < rungs; i++) {
    const t = (i + 0.25) / rungs;
    const len = 5.2 - t * 1.1;
    const d = 6 + t * travel;

    north.moveTo(cx - len, cy - outer / 2 + d);
    north.lineTo(cx + len, cy - outer / 2 + d);

    south.moveTo(cx - len, cy + outer / 2 - d);
    south.lineTo(cx + len, cy + outer / 2 - d);

    west.moveTo(cx - outer / 2 + d, cy - len);
    west.lineTo(cx - outer / 2 + d, cy + len);

    east.moveTo(cx + outer / 2 - d, cy - len);
    east.lineTo(cx + outer / 2 - d, cy + len);
  }

  const stroke = { color: 0xc8c8c2, width: 1.45, alpha: 0.84 } as const;
  north.stroke(stroke);
  south.stroke(stroke);
  west.stroke(stroke);
  east.stroke(stroke);
  parent.addChild(north, south, west, east);
}
