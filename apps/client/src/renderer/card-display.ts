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

  gfx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  gfx.fill({ color: faceUp ? 0xfffdf8 : 0x1a4d7a });
  gfx.stroke({ color: faceUp ? 0xc8c0b0 : 0x0d2840, width: 2 });
  container.addChild(gfx);

  if (faceUp && card) {
    const color = SUIT_COLORS[card.suit];
    const symbol = SUIT_SYMBOLS[card.suit];
    const label = rankLabel(card.rank);

    const topLeft = new Text({
      text: `${label}\n${symbol}`,
      style: { fontFamily: 'Georgia, serif', fontSize: 18, fill: color, lineHeight: 20 },
    });
    topLeft.x = 8;
    topLeft.y = 6;

    const center = new Text({
      text: symbol,
      style: { fontFamily: 'Georgia, serif', fontSize: 36, fill: color },
    });
    center.anchor.set(0.5);
    center.x = CARD_WIDTH / 2;
    center.y = CARD_HEIGHT / 2;

    container.addChild(topLeft, center);
  } else {
    const pattern = new Graphics();
    pattern.roundRect(8, 8, CARD_WIDTH - 16, CARD_HEIGHT - 16, 4);
    pattern.fill({ color: 0x2563a8 });
    pattern.stroke({ color: 0x3d7cc9, width: 1 });
    container.addChild(pattern);
  }

  return container;
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
  glow.roundRect(-3, -3, CARD_WIDTH + 6, CARD_HEIGHT + 6, CARD_RADIUS + 2);

  let color = 0xffffff;
  let width = 1;
  let alpha = 0.4;

  if (hint) {
    color = 0x66e0ff;
    width = 4;
    alpha = 1;
  } else if (playable) {
    color = 0xd4a843;
    width = 3;
    alpha = 1;
  }

  glow.stroke({ color, width, alpha });
  container.addChildAt(glow, 0);
}
