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
  const gfx = new Graphics();

  const shadow = new Graphics();
  shadow.roundRect(3, 4, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  shadow.fill({ color: 0x000000, alpha: 0.3 });
  container.addChild(shadow);

  gfx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  if (faceUp) {
    gfx.fill({ color: 0xfffdf5 });
    gfx.stroke({ color: 0x9a9080, width: 1.5 });
  } else {
    gfx.fill({ color: 0x6b6b6b });
    gfx.stroke({ color: 0x4a4a4a, width: 2 });
  }
  container.addChild(gfx);

  if (faceUp && card) {
    drawFace(container, card);
  } else {
    drawStoneBack(container);
  }

  return container;
}

function drawFace(container: Container, card: Card): void {
  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const label = rankLabel(card.rank);

  const cornerStyle = {
    fontFamily: 'Georgia, serif',
    fontSize: 17,
    fontWeight: '700' as const,
    fill: color,
    lineHeight: 19,
  };

  const topLeft = new Text({ text: `${label}\n${symbol}`, style: cornerStyle });
  topLeft.x = 7;
  topLeft.y = 5;

  const bottomRight = new Text({ text: `${label}\n${symbol}`, style: cornerStyle });
  bottomRight.anchor.set(1);
  bottomRight.rotation = Math.PI;
  bottomRight.x = CARD_WIDTH - 7;
  bottomRight.y = CARD_HEIGHT - 5;

  const center = new Text({
    text: symbol,
    style: { fontFamily: 'Georgia, serif', fontSize: 36, fill: color },
  });
  center.anchor.set(0.5);
  center.x = CARD_WIDTH / 2;
  center.y = CARD_HEIGHT / 2;

  container.addChild(topLeft, bottomRight, center);
}

function drawStoneBack(container: Container): void {
  const inset = new Graphics();
  inset.roundRect(5, 5, CARD_WIDTH - 10, CARD_HEIGHT - 10, 5);
  inset.fill({ color: 0x5a5a5a });
  inset.stroke({ color: 0x3d3d3d, width: 1 });
  container.addChild(inset);

  // Granite speckle texture
  for (let i = 0; i < 28; i++) {
    const sx = 10 + ((i * 17) % (CARD_WIDTH - 20));
    const sy = 10 + ((i * 23) % (CARD_HEIGHT - 20));
    const speck = new Graphics();
    speck.circle(sx, sy, 1 + (i % 2));
    speck.fill({ color: i % 3 === 0 ? 0x888888 : 0x3a3a3a, alpha: 0.5 });
    container.addChild(speck);
  }

  const crack = new Graphics();
  crack.moveTo(CARD_WIDTH * 0.3, 12);
  crack.lineTo(CARD_WIDTH * 0.45, CARD_HEIGHT * 0.5);
  crack.lineTo(CARD_WIDTH * 0.35, CARD_HEIGHT - 12);
  crack.stroke({ color: 0x3a3a3a, width: 1, alpha: 0.4 });
  container.addChild(crack);
}

export function setCardHighlight(
  container: Container,
  highlighted: boolean,
  playable: boolean,
  hint = false,
): void {
  const existing = container.children.find((c) => c.label === 'highlight');
  if (existing) existing.destroy();

  if (!highlighted && !playable && !hint) return;

  const glow = new Graphics();
  glow.label = 'highlight';
  glow.roundRect(-4, -4, CARD_WIDTH + 8, CARD_HEIGHT + 8, CARD_RADIUS + 3);

  if (hint) {
    glow.stroke({ color: 0x66ff88, width: 4, alpha: 1 });
  } else if (playable) {
    glow.stroke({ color: 0xaaff66, width: 3, alpha: 1 });
    glow.roundRect(-2, -2, CARD_WIDTH + 4, CARD_HEIGHT + 4, CARD_RADIUS + 2);
    glow.stroke({ color: 0x44cc44, width: 1, alpha: 0.6 });
  } else {
    glow.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
  }

  container.addChildAt(glow, 0);
}

/** Stock count badge centered on face-down pile. */
export function setStockCount(container: Container, count: number): void {
  const existing = container.children.find((c) => c.label === 'stock-count');
  if (existing) existing.destroy();

  const label = new Text({
    text: String(count),
    style: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 28,
      fontWeight: '800',
      fill: 0xffffff,
      dropShadow: {
        color: 0x000000,
        blur: 2,
        distance: 1,
        alpha: 0.8,
      },
    },
  });
  label.label = 'stock-count';
  label.anchor.set(0.5);
  label.x = CARD_WIDTH / 2;
  label.y = CARD_HEIGHT / 2;
  container.addChild(label);
}
