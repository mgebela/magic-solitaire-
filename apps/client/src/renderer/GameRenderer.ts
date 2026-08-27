import {
  Application,
  Container,
  type FederatedPointerEvent,
} from 'pixi.js';
import type { Card, CardId, GameState } from '@three-towers/shared';
import { getPlayableCards, cardPointsForCombo } from '@three-towers/game-engine';
import { TweenManager, tween } from './animations';
import {
  createCardGraphic,
  createStockGraphic,
  createWasteSlotGraphic,
  setCardHighlight,
  setStockCount,
} from './card-display';
import { ScoreEffectManager } from './score-effects';
import { drawMagicTableBackground } from './table-background';
import { drawTowerOrbs } from './tower-orbs';
import { CARD_WIDTH } from './constants';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  STOCK_POSITION,
  TABLEAU_POSITIONS,
  WASTE_POSITION,
  type CardPosition,
} from './layout-positions';

export type CardClickHandler = (cardId: CardId) => void;
export type DrawClickHandler = () => void;

interface CardSpriteEntry {
  container: Container;
  cardId: CardId;
  slot: 'tableau' | 'waste' | 'stock';
  tableauIndex?: number;
  faceUp?: boolean;
}

function isLive(container: Container): boolean {
  return !container.destroyed;
}

function setPosition(container: Container, x: number, y: number): void {
  if (!isLive(container)) return;
  container.position.set(x, y);
}

/**
 * PixiJS renderer for TriPeaks — reads GameState, never computes game logic.
 */
export class GameRenderer {
  private app: Application | null = null;
  private root = new Container();
  private tableauLayer = new Container();
  private pilesLayer = new Container();
  private overlayLayer = new Container();
  private sprites = new Map<string, CardSpriteEntry>();
  private tweens = new TweenManager();
  private scoreEffects = new ScoreEffectManager();
  private state: GameState | null = null;
  private hintCardId: CardId | null = null;
  private onCardClick: CardClickHandler | null = null;
  private onDrawClick: DrawClickHandler | null = null;
  private lastTime = performance.now();
  private destroyed = false;
  private ready = false;
  private initFinished = false;
  private pendingState: { state: GameState; animate: boolean } | null = null;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.destroyed = false;
    this.app = new Application();
    await this.app.init({
      canvas,
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    if (this.destroyed) {
      this.app.destroy(false, { children: true });
      this.app = null;
      return;
    }

    await this.loadBackground();
    if (this.destroyed) {
      this.app.destroy(false, { children: true });
      this.app = null;
      return;
    }

    this.root.addChild(this.tableauLayer, this.pilesLayer, this.overlayLayer);
    this.app.stage.addChild(this.root);

    this.app.ticker.add(() => {
      if (this.destroyed || !this.ready) return;
      const now = performance.now();
      const dt = now - this.lastTime;
      this.lastTime = now;
      this.tweens.update(dt);
    });

    this.initFinished = true;
    this.ready = true;
    if (this.pendingState) {
      const { state, animate } = this.pendingState;
      this.pendingState = null;
      this.renderState(state, animate);
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.ready = false;
    this.pendingState = null;
    this.tweens.clear();
    this.scoreEffects.clear();
    this.sprites.clear();
    if (this.initFinished && this.app) {
      this.app.destroy(false, { children: true });
      this.app = null;
    }
  }

  setOnCardClick(handler: CardClickHandler | null): void {
    this.onCardClick = handler;
  }

  setOnDrawClick(handler: DrawClickHandler | null): void {
    this.onDrawClick = handler;
  }

  setHintCardId(cardId: CardId | null): void {
    this.hintCardId = cardId;
    if (this.state && this.ready) {
      this.syncTableau(this.state, this.state, false);
    }
  }

  resize(width: number, height: number): void {
    if (!this.app || this.destroyed || !this.ready) return;
    const scale = Math.min(width / BOARD_WIDTH, height / BOARD_HEIGHT);
    this.root.scale.set(scale);
    this.root.x = (width - BOARD_WIDTH * scale) / 2;
    this.root.y = (height - BOARD_HEIGHT * scale) / 2;
    this.app.renderer.resize(width, height);
  }

  /** Full sync from a new GameState snapshot. */
  renderState(state: GameState, animate = true): void {
    if (!this.ready || this.destroyed) {
      this.pendingState = { state, animate: false };
      return;
    }

    const prev = this.state;
    this.state = state;

    this.syncTableau(state, prev, animate);
    this.syncWaste(state, prev, animate);
    this.syncStock(state);
  }

  private async loadBackground(): Promise<void> {
    const bg = await drawMagicTableBackground();
    if (this.destroyed) {
      bg.destroy({ children: true });
      return;
    }
    const orbs = await drawTowerOrbs();
    if (this.destroyed) {
      bg.destroy({ children: true });
      orbs.destroy({ children: true });
      return;
    }
    this.root.addChildAt(bg, 0);
    this.root.addChildAt(orbs, 1);

    const wasteSlot = createWasteSlotGraphic();
    setPosition(wasteSlot, WASTE_POSITION.x, WASTE_POSITION.y);
    this.pilesLayer.addChild(wasteSlot);
  }

  private syncTableau(state: GameState, prev: GameState | null, animate: boolean): void {
    const playableCards = getPlayableCards(state.tableau, state.uncovered, state.waste);
    const validPlays = new Set(playableCards.map((c) => c.id));

    const activeKeys = new Set<string>();

    state.tableau.forEach((card, index) => {
      if (!card) return;
      const key = `tableau-${index}`;
      activeKeys.add(key);

      const pos = TABLEAU_POSITIONS[index];
      if (!pos) return;

      const isPlayable = validPlays.has(card.id);
      const isUncovered = state.uncovered.includes(card.id);
      const faceUp = isUncovered;

      let entry = this.sprites.get(key);
      if (!entry) {
        const container = this.makeInteractiveCard(card, faceUp, () => this.onCardClick?.(card.id));
        entry = { container, cardId: card.id, slot: 'tableau', tableauIndex: index, faceUp };
        this.sprites.set(key, entry);
        this.tableauLayer.addChild(container);
        setPosition(container, pos.x, pos.y);
      } else if (entry.cardId !== card.id || entry.faceUp !== faceUp) {
        this.replaceCardGraphic(entry.container, card, faceUp);
        entry.cardId = card.id;
        entry.faceUp = faceUp;
      }

      if (!isLive(entry.container)) return;

      entry.container.zIndex = pos.layer;
      this.tableauLayer.sortableChildren = true;
      setPosition(entry.container, pos.x, pos.y);

      setCardHighlight(entry.container, isUncovered, isPlayable, card.id === this.hintCardId);
      entry.container.eventMode = isPlayable ? 'static' : 'none';
      entry.container.cursor = isPlayable ? 'pointer' : 'default';
    });

    for (const [key, entry] of this.sprites) {
      if (!key.startsWith('tableau-') || activeKeys.has(key)) continue;

      const wasJustPlayed =
        prev &&
        animate &&
        prev.moves.length < state.moves.length &&
        state.moves[state.moves.length - 1]?.type === 'play';

      if (wasJustPlayed && isLive(entry.container)) {
        const lastMove = state.moves[state.moves.length - 1];
        if (lastMove?.type === 'play') {
          const points = cardPointsForCombo(state.combo);
          this.scoreEffects.spawn(
            this.overlayLayer,
            this.tweens,
            entry.container.x + CARD_WIDTH / 2,
            entry.container.y,
            points,
            state.combo,
          );
        }

        this.animateToWaste(entry.container, () => {
          if (isLive(entry.container)) {
            entry.container.destroy({ children: true });
          }
          this.sprites.delete(key);
        });
      } else {
        if (isLive(entry.container)) {
          entry.container.destroy({ children: true });
        }
        this.sprites.delete(key);
      }
    }
  }

  private syncWaste(state: GameState, prev: GameState | null, animate: boolean): void {
    const key = 'waste';
    const pos = WASTE_POSITION;

    if (!state.waste) {
      const existing = this.sprites.get(key);
      if (existing) {
        if (isLive(existing.container)) {
          existing.container.destroy({ children: true });
        }
        this.sprites.delete(key);
      }
      return;
    }

    let entry = this.sprites.get(key);
    if (!entry) {
      const container = createCardGraphic(state.waste, true);
      entry = { container, cardId: state.waste.id, slot: 'waste' };
      this.sprites.set(key, entry);
      this.pilesLayer.addChild(container);
    } else if (entry.cardId !== state.waste.id) {
      this.replaceCardGraphic(entry.container, state.waste, true);
      entry.cardId = state.waste.id;

      const lastMove = state.moves[state.moves.length - 1];
      if (animate && prev && lastMove?.type === 'draw') {
        setPosition(entry.container, STOCK_POSITION.x, STOCK_POSITION.y);
        this.animateToPosition(entry.container, pos, 250);
        return;
      }
    }

    setPosition(entry.container, pos.x, pos.y);
    if (isLive(entry.container)) {
      entry.container.zIndex = pos.layer;
    }
  }

  private syncStock(state: GameState): void {
    const key = 'stock';
    const pos = STOCK_POSITION;
    let entry = this.sprites.get(key);

    if (state.stock.length === 0) {
      if (entry) {
        if (isLive(entry.container)) {
          entry.container.destroy({ children: true });
        }
        this.sprites.delete(key);
      }
      return;
    }

    if (!entry) {
      const container = createStockGraphic();
      container.eventMode = 'static';
      container.cursor = 'pointer';
      container.on('pointertap', () => {
        this.onDrawClick?.();
      });
      entry = { container, cardId: 'stock', slot: 'stock' };
      this.sprites.set(key, entry);
      this.pilesLayer.addChild(container);
    }

    setPosition(entry.container, pos.x, pos.y);
    if (isLive(entry.container)) {
      setStockCount(entry.container, state.stock.length);
    }
  }

  private makeInteractiveCard(card: Card, faceUp: boolean, onClick: () => void): Container {
    const container = createCardGraphic(card, faceUp);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointertap', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      onClick();
    });
    return container;
  }

  private replaceCardGraphic(container: Container, card: Card, faceUp: boolean): void {
    if (!isLive(container)) return;
    container.removeChildren();
    const fresh = createCardGraphic(card, faceUp);
    for (const child of [...fresh.children]) {
      container.addChild(child);
    }
    fresh.destroy({ children: false });
  }

  private animateToWaste(container: Container, onComplete: () => void): void {
    this.animateToPosition(container, WASTE_POSITION, 280, onComplete);
  }

  private animateToPosition(
    container: Container,
    pos: CardPosition,
    durationMs: number,
    onComplete?: () => void,
  ): void {
    if (!isLive(container)) {
      onComplete?.();
      return;
    }
    const fromX = container.x;
    const fromY = container.y;
    this.tweens.add(
      tween(
        durationMs,
        (t) => {
          if (!isLive(container)) return;
          container.x = fromX + (pos.x - fromX) * t;
          container.y = fromY + (pos.y - fromY) * t;
          container.scale.set(1 - t * 0.05);
        },
        onComplete,
      ),
    );
  }
}
