import { Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { PEAK_INDICES, TABLEAU_POSITIONS } from './layout-positions';
import { CARD_WIDTH } from './constants';

/** Weathered limestone pyramid shrine with a caged neon orb above each peak. */
export async function drawTowerOrbs(): Promise<Container> {
  const stoneTex = (await Assets.load('/textures/space-towers-stone.png')) as Texture;
  const orbs = new Container();

  for (const index of PEAK_INDICES) {
    const pos = TABLEAU_POSITIONS[index];
    const cx = pos.x + CARD_WIDTH / 2;
    orbs.addChild(drawShrine(stoneTex, cx, pos.y));
  }

  return orbs;
}

function drawShrine(stoneTex: Texture, cx: number, peakY: number): Container {
  const shrine = new Container();
  const orbY = peakY - 58;

  const bloom = new Graphics();
  bloom.circle(cx, orbY, 58);
  bloom.fill({ color: 0x1dff55, alpha: 0.13 });
  bloom.circle(cx, orbY, 30);
  bloom.fill({ color: 0x6dff45, alpha: 0.26 });
  shrine.addChild(bloom);

  const shadow = new Graphics();
  shadow.ellipse(cx, peakY + 36, 62, 11);
  shadow.fill({ color: 0x000000, alpha: 0.32 });
  shrine.addChild(shadow);

  // Pyramid tucks behind the peak card so the tableau sits on the shrine.
  addStoneBlock(shrine, stoneTex, cx - 62, peakY + 10, 58, 36, 6);
  addStoneBlock(shrine, stoneTex, cx + 4, peakY + 12, 58, 34, 6);
  addStoneBlock(shrine, stoneTex, cx - 44, peakY - 18, 88, 32, 6);
  addStoneBlock(shrine, stoneTex, cx - 30, peakY - 46, 60, 30, 6);

  addMossTuft(shrine, cx - 58, peakY + 38, 1);
  addMossTuft(shrine, cx + 54, peakY + 36, -1);
  addMossTuft(shrine, cx - 38, peakY - 8, 1);
  addMossTuft(shrine, cx + 32, peakY - 12, -1);

  const cage = new Graphics();
  cage.roundRect(cx - 18, peakY - 80, 36, 36, 3);
  cage.fill({ color: 0x141412 });
  cage.roundRect(cx - 18, peakY - 80, 36, 36, 3);
  cage.stroke({ color: 0xcac6b0, width: 2.6 });
  cage.moveTo(cx - 18, peakY - 62);
  cage.lineTo(cx + 18, peakY - 62);
  cage.moveTo(cx, peakY - 80);
  cage.lineTo(cx, peakY - 44);
  cage.moveTo(cx - 12, peakY - 76);
  cage.lineTo(cx - 5, peakY - 48);
  cage.moveTo(cx + 12, peakY - 76);
  cage.lineTo(cx + 5, peakY - 48);
  cage.stroke({ color: 0xeae6d4, width: 1.2, alpha: 0.75 });
  shrine.addChild(cage);

  const well = new Graphics();
  well.roundRect(cx - 12, peakY - 74, 24, 22, 2);
  well.fill({ color: 0x030503 });
  shrine.addChild(well);

  const glow = new Graphics();
  glow.circle(cx, orbY, 15);
  glow.fill({ color: 0x33ff66, alpha: 0.55 });
  shrine.addChild(glow);

  const light = new Graphics();
  light.circle(cx, orbY, 9);
  light.fill({ color: 0x2cff55 });
  light.circle(cx - 2.2, orbY - 3, 3);
  light.fill({ color: 0xf4ffe8, alpha: 0.95 });
  shrine.addChild(light);

  return shrine;
}

function addMossTuft(parent: Container, x: number, y: number, dir: number): void {
  const moss = new Graphics();
  moss.moveTo(x, y);
  moss.quadraticCurveTo(x + dir * 10, y - 16, x + dir * 18, y - 4);
  moss.quadraticCurveTo(x + dir * 8, y - 6, x, y);
  moss.fill({ color: 0x1b5c1e, alpha: 0.88 });
  moss.moveTo(x + dir * 4, y - 2);
  moss.quadraticCurveTo(x + dir * 14, y - 20, x + dir * 22, y - 2);
  moss.quadraticCurveTo(x + dir * 10, y - 4, x + dir * 4, y - 2);
  moss.fill({ color: 0x2d8a32, alpha: 0.8 });
  parent.addChild(moss);
}

function addStoneBlock(
  parent: Container,
  texture: Texture,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
): void {
  const plate = new Sprite(texture);
  plate.x = x;
  plate.y = y;
  plate.width = w;
  plate.height = h;
  parent.addChild(plate);

  const mask = new Graphics();
  mask.roundRect(x, y, w, h, radius);
  mask.fill({ color: 0xffffff });
  plate.mask = mask;
  parent.addChild(mask);

  const frame = new Graphics();
  frame.roundRect(x, y, w, h, radius);
  frame.stroke({ color: 0x3f3c32, width: 2.2 });
  frame.moveTo(x + 6, y + 3);
  frame.lineTo(x + w - 6, y + 3);
  frame.stroke({ color: 0xeee8d4, width: 1.6, alpha: 0.32 });
  frame.moveTo(x + 6, y + h - 4);
  frame.lineTo(x + w - 6, y + h - 4);
  frame.stroke({ color: 0x1c1a14, width: 1.6, alpha: 0.35 });
  parent.addChild(frame);

  const pits = new Graphics();
  for (let i = 0; i < 12; i++) {
    const px = x + 8 + ((i * 19) % (w - 16));
    const py = y + 6 + ((i * 13) % (h - 12));
    pits.circle(px, py, 1.2 + (i % 3) * 0.5);
    pits.fill({ color: i % 2 ? 0x5c5848 : 0xd8d4c0, alpha: 0.42 });
  }
  parent.addChild(pits);
}
