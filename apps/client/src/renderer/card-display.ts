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

  // Drop shadow
  const shadow = new Graphics();
  shadow.roundRect(3, 4, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  shadow.fill({ color: 0x000000, alpha: 0.25 });
  container.addChild(shadow);

  gfx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  if (faceUp) {
    gfx.fill({ color: 0xfffdf8 });
    gfx.stroke({ color: 0xc8c0b0, width: 1.5 });
  } else {
    gfx.fill({ color: 0x1a2a5e });
    gfx.stroke({ color: 0xd4a843, width: 2 });
  }
  container.addChild(gfx);

  if (faceUp && card) {
    const color = SUIT_COLORS[card.suit];
    const symbol = SUIT_SYMBOLS[card.suit];
    const label = rankLabel(card.rank);

    const cornerStyle = {
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      fontWeight: '700' as const,
      fill: color,
      lineHeight: 18,
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
      style: { fontFamily: 'Georgia, serif', fontSize: 34, fill: color },
    });
    center.anchor.set(0.5);
    center.x = CARD_WIDTH / 2;
    center.y = CARD_HEIGHT / 2;

    container.addChild(topLeft, bottomRight, center);
  } else {
    drawCardBack(container);
  }

  return container;
}

function drawCardBack(container: Container): void {
  const inset = new Graphics();
  inset.roundRect(6, 6, CARD_WIDTH - 12, CARD_HEIGHT - 12, 5);
  inset.fill({ color: 0x243878 });
  inset.stroke({ color: 0xd4a843, width: 1, alpha: 0.6 });
  container.addChild(inset);

  const star = new Text({
    text: '✦',
    style: { fontFamily: 'Georgia, serif', fontSize: 28, fill: 0xd4a843 },
  });
  star.anchor.set(0.5);
  star.x = CARD_WIDTH / 2;
  star.y = CARD_HEIGHT / 2;
  container.addChild(star);

  // Corner diamonds
  for (const [x, y] of [
    [14, 14],
    [CARD_WIDTH - 14, 14],
    [14, CARD_HEIGHT - 14],
    [CARD_WIDTH - 14, CARD_HEIGHT - 14],
  ]) {
    const gem = new Text({
      text: '◆',
      style: { fontFamily: 'Georgia, serif', fontSize: 10, fill: 0xd4a843 },
    });
    gem.alpha = 0.7;
    gem.anchor.set(0.5);
    gem.x = x;
    gem.y = y;
    container.addChild(gem);
  }
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
    glow.stroke({ color: 0x66e0ff, width: 4, alpha: 1 });
  } else if (playable) {
    glow.stroke({ color: 0xf0d080, width: 3, alpha: 1 });
    glow.roundRect(-2, -2, CARD_WIDTH + 4, CARD_HEIGHT + 4, CARD_RADIUS + 2);
    glow.stroke({ color: 0xd4a843, width: 1, alpha: 0.5 });
  } else {
    glow.stroke({ color: 0xffffff, width: 1, alpha: 0.35 });
  }

  container.addChildAt(glow, 0);
}
