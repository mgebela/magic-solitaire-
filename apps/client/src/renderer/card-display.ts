import { Container, Graphics, Text } from 'pixi.js';
import type { Card } from '@three-towers/shared';
import {
  CARD_HEIGHT,
  CARD_RADIUS,
  CARD_WIDTH,
  SUIT_COLORS,
  SUIT_SYMBOLS,
  rankLabel,
} from './constants';

export function createCardGraphic(card: Card | null, faceUp: boolean): Container {
  const container = new Container();

  const shadow = new Graphics();
  shadow.roundRect(3, 5, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  shadow.fill({ color: 0x000000, alpha: 0.38 });
  container.addChild(shadow);

  const gfx = new Graphics();
  gfx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  if (faceUp) {
    gfx.fill({ color: 0xfffdf8 });
    gfx.stroke({ color: 0xb8b0a4, width: 1.4 });
  } else {
    gfx.fill({ color: 0x6a6a6a });
    gfx.stroke({ color: 0x3a3a3a, width: 2.2 });
  }
  container.addChild(gfx);

  if (faceUp && card) {
    drawFace(container, card);
  } else {
    drawStoneBack(container);
  }

  return container;
}

/** Face-down stock with stacked edges so it reads as a draw pile. */
export function createStockGraphic(): Container {
  const container = new Container();
  for (let i = 3; i >= 1; i--) {
    const layer = new Graphics();
    layer.roundRect(-i * 2, -i * 2, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
    layer.fill({ color: 0x4e4e4e });
    layer.stroke({ color: 0x2a2a2a, width: 1 });
    container.addChild(layer);
  }
  container.addChild(createCardGraphic(null, false));
  return container;
}

/** Empty stone recess for the waste pile (starts vacant in classic TriPeaks). */
export function createWasteSlotGraphic(): Container {
  const container = new Container();
  const slot = new Graphics();
  slot.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  slot.fill({ color: 0x2a2a2a, alpha: 0.55 });
  slot.stroke({ color: 0x1a1a1a, width: 2, alpha: 0.8 });
  container.addChild(slot);
  return container;
}

function drawFace(container: Container, card: Card): void {
  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const label = rankLabel(card.rank);

  const rank = new Text({
    text: label,
    style: {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: label.length > 1 ? 28 : 36,
      fontWeight: '800',
      fill: color,
    },
  });
  rank.x = 7;
  rank.y = 4;

  const suitCorner = new Text({
    text: symbol,
    style: { fontFamily: 'Georgia, serif', fontSize: 16, fill: color },
  });
  suitCorner.x = CARD_WIDTH - 22;
  suitCorner.y = 6;

  const center = new Text({
    text: symbol,
    style: { fontFamily: 'Georgia, serif', fontSize: 34, fill: color },
  });
  center.anchor.set(0.5);
  center.x = CARD_WIDTH / 2;
  center.y = CARD_HEIGHT * 0.58;

  container.addChild(rank, suitCorner, center);
}

function drawStoneBack(container: Container): void {
  const inset = new Graphics();
  inset.roundRect(5, 5, CARD_WIDTH - 10, CARD_HEIGHT - 10, 5);
  inset.fill({ color: 0x4f4f4f });
  inset.stroke({ color: 0x2e2e2e, width: 2 });
  container.addChild(inset);

  const brick = new Graphics();
  brick.roundRect(10, 10, CARD_WIDTH - 20, CARD_HEIGHT - 20, 3);
  brick.fill({ color: 0x3d3d3d, alpha: 0.55 });
  container.addChild(brick);

  for (let i = 0; i < 22; i++) {
    const sx = 12 + ((i * 17) % (CARD_WIDTH - 24));
    const sy = 12 + ((i * 23) % (CARD_HEIGHT - 24));
    const speck = new Graphics();
    speck.circle(sx, sy, 1 + (i % 2));
    speck.fill({ color: i % 3 === 0 ? 0x8a8a8a : 0x3a3a3a, alpha: 0.45 });
    container.addChild(speck);
  }

  const emblem = new Graphics();
  const cx = CARD_WIDTH / 2;
  const cy = CARD_HEIGHT / 2;
  emblem.circle(cx, cy, 16);
  emblem.fill({ color: 0x6e6e6e, alpha: 0.9 });
  emblem.circle(cx, cy, 16);
  emblem.stroke({ color: 0xd0d0d0, width: 1.6, alpha: 0.7 });
  emblem.circle(cx, cy, 7);
  emblem.fill({ color: 0x33dd55, alpha: 0.55 });
  container.addChild(emblem);
}

export function setCardHighlight(
  container: Container,
  _highlighted: boolean,
  playable: boolean,
  hint = false,
): void {
  if (container.destroyed) return;
  const existing = container.children.find((c) => c.label === 'highlight');
  if (existing) existing.destroy();

  if (!playable && !hint) return;

  const glow = new Graphics();
  glow.label = 'highlight';
  glow.roundRect(-3, -3, CARD_WIDTH + 6, CARD_HEIGHT + 6, CARD_RADIUS + 3);

  if (hint) {
    glow.stroke({ color: 0xbbff66, width: 4, alpha: 1 });
  } else {
    glow.stroke({ color: 0x44ff66, width: 4, alpha: 1 });
  }

  container.addChildAt(glow, 0);
}

/** Stock count badge centered on face-down pile. */
export function setStockCount(container: Container, count: number): void {
  if (container.destroyed) return;
  const existing = container.children.find((c) => c.label === 'stock-count');
  if (existing) existing.destroy();

  const label = new Text({
    text: String(count),
    style: {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: 30,
      fontWeight: '800',
      fill: 0xffffff,
      dropShadow: {
        color: 0x000000,
        blur: 3,
        distance: 1,
        alpha: 0.9,
      },
    },
  });
  label.label = 'stock-count';
  label.anchor.set(0.5);
  label.x = CARD_WIDTH / 2;
  label.y = CARD_HEIGHT / 2;
  container.addChild(label);
}
