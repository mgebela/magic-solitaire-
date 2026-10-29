import {
  Application,
  Container,
  Rectangle,
  Sprite,
  type FederatedPointerEvent,
} from 'pixi.js';
import type { Card, CardId, GameState } from '@three-towers/shared';
import { getPlayableCards, cardPointsForCombo } from '@three-towers/game-engine';
import { TweenManager, easeInOutCubic, easeOutBack, easeOutQuart, tween } from './animations';
import {
  createCardGraphic,
  createStockGraphic,
  createWasteSlotGraphic,
  setCardHighlight,
  setStockAlert,
  setStockCount,
} from './card-display';
import { ScoreEffectManager } from './score-effects';
import { WinCelebration } from './win-celebration';
import { drawMagicTableBackground } from './table-background';
import { createPeakLights, type PeakLights } from './tower-orbs';
import { CARD_HEIGHT, CARD_WIDTH } from './constants';
import { sound } from '../lib/sound';
import {
  applyDesktopLayout,
  applyWideLayout,
  BOARD_ASPECT,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  layoutStoneTop,
  layoutWasteScale,
  overlayPercents,
  STOCK_POSITION,
  STONE_PANEL_TOP,
  TABLEAU_POSITIONS,
  WASTE_POSITION,
  type CardPosition,
} from './layout-positions';

export type CardClickHandler = (cardId: CardId) => void;
export type DrawClickHandler = () => void;

interface CardSpriteEntry {
  container: Container;
  motion: Container;
  cardId: CardId;
  slot: 'tableau' | 'waste' | 'stock';
  tableauIndex?: number;
  faceUp?: boolean;
  flipping?: boolean;
}

function isLive(container: Container): boolean {
  return !container.destroyed;
}

/**
 * Root stays top-left for hit-testing. Motion child is pivoted at the
 * card center so flips/arcs/hovers don't shift the clickable box.
 */
function assembleCard(art: Container): { root: Container; motion: Container } {
  const root = new Container();
  const motion = new Container();
  motion.position.set(CARD_WIDTH / 2, CARD_HEIGHT / 2);
  motion.pivot.set(CARD_WIDTH / 2, CARD_HEIGHT / 2);
  motion.addChild(art);
  root.addChild(motion);
  root.hitArea = new Rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT);
  root.interactiveChildren = false;
  return { root, motion };
}

function artOf(entry: CardSpriteEntry): Container | null {
  const art = entry.motion.children[0];
  return art instanceof Container && !art.destroyed ? art : null;
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
  private winCelebration = new WinCelebration();
  private peakLights: PeakLights | null = null;
  private tableSprite: Sprite | null = null;
  private wasteSlot: Container | null = null;
  private layoutWide = false;
  private fitH = BOARD_HEIGHT;
  private state: GameState | null = null;
  private hintCardId: CardId | null = null;
  private onCardClick: CardClickHandler | null = null;
  private onDrawClick: DrawClickHandler | null = null;
  private lastTime = performance.now();
  private destroyed = false;
  private ready = false;
  private initFinished = false;
  private pendingState: { state: GameState; animate: boolean } | null = null;
  private wasteFlyer: Container | null = null;

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

    this.tableauLayer.sortableChildren = true;
    this.pilesLayer.sortableChildren = true;
    this.overlayLayer.sortableChildren = true;
    this.root.addChild(this.tableauLayer);
    if (this.peakLights) this.root.addChild(this.peakLights.root);
    this.root.addChild(this.pilesLayer, this.overlayLayer);
    this.app.stage.addChild(this.root);

    this.app.ticker.add(() => {
      if (this.destroyed || !this.ready) return;
      const now = performance.now();
      const dt = now - this.lastTime;
      this.lastTime = now;
      this.tweens.update(dt);
      this.pulseHighlights(now);
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
    this.wasteFlyer = null;
    this.tweens.clear();
    this.scoreEffects.clear();
    this.winCelebration.clear();
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
    if (!this.app || this.destroyed || !this.ready || width < 2 || height < 2) return;
    const wide = width / height > BOARD_ASPECT + 0.05;
    if (wide) {
      const fitH = (height / width) * BOARD_WIDTH;
      if (!this.layoutWide || Math.abs(this.fitH - fitH) > 3) {
        applyWideLayout(fitH);
        this.fitH = fitH;
        this.rebuildPeaks();
      }
      this.layoutWide = true;
      const scale = width / BOARD_WIDTH;
      this.root.scale.set(scale);
      this.root.position.set(0, 0);
    } else {
      if (this.layoutWide) {
        applyDesktopLayout();
        this.fitH = BOARD_HEIGHT;
        this.rebuildPeaks();
      }
      this.layoutWide = false;
      const scale = Math.min(width / BOARD_WIDTH, height / BOARD_HEIGHT);
      this.root.scale.set(scale);
      this.root.x = (width - BOARD_WIDTH * scale) / 2;
      this.root.y = (height - BOARD_HEIGHT * scale) / 2;
    }
    this.placeTable();
    this.repositionPieces();
    this.app.renderer.resize(width, height);
    this.publishOverlay();
  }

  /** Full sync from a new GameState snapshot. */
  renderState(state: GameState, animate = true): void {
    if (!this.ready || this.destroyed) {
      this.pendingState = { state, animate: false };
      return;
    }

    const prev = this.state;
    this.state = state;

    if (prev && animate) {
      const lastMove = state.moves[state.moves.length - 1];
      if (state.moves.length > prev.moves.length && lastMove) {
        if (lastMove.type === 'play') sound.playCard(state.combo);
        if (lastMove.type === 'draw') sound.draw();
      }
      if (prev.status === 'playing' && state.status === 'won') {
        sound.win();
        this.winCelebration.play(this.overlayLayer, this.tweens);
      }
      if (prev.status === 'playing' && state.status === 'lost') sound.lose();
    }

    this.peakLights?.sync(
      [0, 1, 2].map((index) => state.tableau[index] === null),
      state.status === 'lost',
    );

    if (state.status === 'playing' && prev?.status !== 'playing') {
      this.winCelebration.clear();
    }

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
    const sprite = bg.children[0];
    this.tableSprite = sprite instanceof Sprite ? sprite : null;
    this.peakLights = createPeakLights();
    this.root.addChildAt(bg, 0);
    this.root.addChildAt(this.peakLights.root, 1);

    const wasteSlot = createWasteSlotGraphic();
    wasteSlot.pivot.set(CARD_WIDTH / 2, CARD_HEIGHT / 2);
    wasteSlot.scale.set(layoutWasteScale);
    wasteSlot.position.set(
      WASTE_POSITION.x + CARD_WIDTH / 2,
      WASTE_POSITION.y + CARD_HEIGHT / 2,
    );
    wasteSlot.zIndex = WASTE_POSITION.layer;
    this.wasteSlot = wasteSlot;
    this.pilesLayer.addChild(wasteSlot);
  }

  /** Shift the photo so its limestone lip stays under the cards. */
  private placeTable(): void {
    if (!this.tableSprite) return;
    this.tableSprite.y = layoutStoneTop - STONE_PANEL_TOP;
  }

  private rebuildPeaks(): void {
    if (this.peakLights) {
      this.root.removeChild(this.peakLights.root);
      this.peakLights.root.destroy({ children: true });
    }
    this.peakLights = createPeakLights();
    const pilesIndex = this.root.getChildIndex(this.pilesLayer);
    this.root.addChildAt(this.peakLights.root, pilesIndex);
    if (!this.state) return;
    this.peakLights.sync(
      [0, 1, 2].map((index) => this.state?.tableau[index] === null),
      this.state.status === 'lost',
    );
  }

  private repositionPieces(): void {
    for (const entry of this.sprites.values()) {
      if (!isLive(entry.container)) continue;
      if (entry.slot === 'tableau' && entry.tableauIndex != null) {
        this.place(entry.container, TABLEAU_POSITIONS[entry.tableauIndex]);
      } else if (entry.slot === 'stock') {
        this.place(entry.container, STOCK_POSITION);
      } else if (entry.slot === 'waste') {
        this.place(entry.container, WASTE_POSITION);
        entry.motion.scale.set(layoutWasteScale);
      }
    }
    if (this.wasteSlot && isLive(this.wasteSlot)) {
      this.wasteSlot.scale.set(layoutWasteScale);
      this.wasteSlot.position.set(
        WASTE_POSITION.x + CARD_WIDTH / 2,
        WASTE_POSITION.y + CARD_HEIGHT / 2,
      );
    }
  }

  private publishOverlay(): void {
    const frame = this.app?.canvas.parentElement;
    if (!frame) return;
    const metrics = overlayPercents();
    frame.style.setProperty('--stock-left', metrics.stockLeft);
    frame.style.setProperty('--stock-top', metrics.stockTop);
    frame.style.setProperty('--stock-w', metrics.stockW);
    frame.style.setProperty('--stock-h', metrics.stockH);
    frame.style.setProperty('--waste-badge-left', metrics.wasteLeft);
    frame.style.setProperty('--waste-badge-top', metrics.wasteTop);
  }

  private place(container: Container, pos: CardPosition): void {
    if (!isLive(container)) return;
    container.position.set(pos.x, pos.y);
    container.zIndex = pos.layer;
  }

  private pulseHighlights(now: number): void {
    const pulse = 0.62 + Math.sin(now / 260) * 0.28;
    for (const entry of this.sprites.values()) {
      const art = artOf(entry);
      if (!art) continue;
      const glow = art.children.find((child) => child.label === 'highlight');
      if (glow) glow.alpha = pulse;
    }
  }

  private isPlayableId(cardId: CardId): boolean {
    if (!this.state) return false;
    return getPlayableCards(this.state.tableau, this.state.uncovered, this.state.waste).some(
      (card) => card.id === cardId,
    );
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
        entry = this.makeInteractiveCard(card, faceUp, index);
        this.sprites.set(key, entry);
        this.tableauLayer.addChild(entry.container);
        this.place(entry.container, pos);
      } else if (entry.cardId !== card.id) {
        this.replaceCardGraphic(entry, card, faceUp);
        entry.cardId = card.id;
        entry.faceUp = faceUp;
      } else if (entry.faceUp !== faceUp && !entry.flipping) {
        if (animate && faceUp) {
          this.animateFlip(entry, card, true);
        } else {
          this.replaceCardGraphic(entry, card, faceUp);
          entry.faceUp = faceUp;
        }
      }

      if (!isLive(entry.container)) return;

      if (!entry.flipping) {
        this.place(entry.container, pos);
      }

      const art = artOf(entry);
      if (art) {
        setCardHighlight(art, isUncovered, isPlayable, card.id === this.hintCardId);
      }
      entry.container.eventMode = isPlayable ? 'static' : 'none';
      entry.container.cursor = isPlayable ? 'pointer' : 'default';
      if (!isPlayable && !entry.flipping) {
        entry.motion.scale.set(1);
      }
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
        if (lastMove?.type === 'play' && lastMove.cardId === entry.cardId && state.waste) {
          this.scoreEffects.spawn(
            this.overlayLayer,
            this.tweens,
            entry.container.x + CARD_WIDTH / 2,
            entry.container.y,
            cardPointsForCombo(state.combo),
            state.combo,
          );
          this.sprites.delete(key);
          this.launchToWaste(entry, state.waste);
          continue;
        }
      }

      if (isLive(entry.container)) {
        entry.container.destroy({ children: true });
      }
      this.sprites.delete(key);
    }
  }

  private syncWaste(state: GameState, prev: GameState | null, animate: boolean): void {
    const key = 'waste';

    if (this.wasteFlyer && isLive(this.wasteFlyer)) {
      return;
    }

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
    const lastMove = state.moves[state.moves.length - 1];
    const drew =
      animate &&
      prev &&
      lastMove?.type === 'draw' &&
      prev.waste?.id !== state.waste.id;

    if (drew) {
      const assembled = assembleCard(createCardGraphic(state.waste, false));
      this.place(assembled.root, STOCK_POSITION);
      this.overlayLayer.addChild(assembled.root);
      const flyer: CardSpriteEntry = {
        container: assembled.root,
        motion: assembled.motion,
        cardId: state.waste.id,
        slot: 'waste',
      };
      this.launchDraw(flyer, state.waste);
      return;
    }

    if (!entry) {
      const assembled = assembleCard(createCardGraphic(state.waste, true));
      entry = {
        container: assembled.root,
        motion: assembled.motion,
        cardId: state.waste.id,
        slot: 'waste',
      };
      this.sprites.set(key, entry);
      this.pilesLayer.addChild(entry.container);
    } else if (entry.cardId !== state.waste.id) {
      this.replaceCardGraphic(entry, state.waste, true);
      entry.cardId = state.waste.id;
    }

    this.place(entry.container, WASTE_POSITION);
    entry.motion.scale.set(layoutWasteScale);
  }

  private syncStock(state: GameState): void {
    const key = 'stock';
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
      const assembled = assembleCard(createStockGraphic());
      assembled.root.eventMode = 'static';
      assembled.root.cursor = 'pointer';
      assembled.root.on('pointertap', () => {
        this.onDrawClick?.();
      });
      entry = {
        container: assembled.root,
        motion: assembled.motion,
        cardId: 'stock',
        slot: 'stock',
      };
      this.sprites.set(key, entry);
      this.pilesLayer.addChild(entry.container);
    }

    this.place(entry.container, STOCK_POSITION);
    const art = artOf(entry);
    if (art) {
      setStockCount(art, state.stock.length);
      const stuck =
        state.status === 'playing' &&
        state.waste !== null &&
        getPlayableCards(state.tableau, state.uncovered, state.waste).length === 0;
      setStockAlert(art, stuck);
    }
  }

  private makeInteractiveCard(card: Card, faceUp: boolean, tableauIndex: number): CardSpriteEntry {
    const assembled = assembleCard(createCardGraphic(card, faceUp));
    const entry: CardSpriteEntry = {
      container: assembled.root,
      motion: assembled.motion,
      cardId: card.id,
      slot: 'tableau',
      tableauIndex,
      faceUp,
    };

    const root = entry.container;
    const motion = entry.motion;
    root.eventMode = 'static';
    root.cursor = 'pointer';
    root.on('pointerover', () => {
      if (!isLive(root) || this.wasteFlyer === root || !this.isPlayableId(entry.cardId)) return;
      motion.scale.set(1.06);
    });
    root.on('pointerout', () => {
      if (!isLive(root) || this.wasteFlyer === root) return;
      motion.scale.set(1);
    });
    root.on('pointerdown', () => {
      if (!isLive(root) || this.wasteFlyer === root || !this.isPlayableId(entry.cardId)) return;
      motion.scale.set(0.95);
    });
    root.on('pointerup', () => {
      if (!isLive(root) || this.wasteFlyer === root || !this.isPlayableId(entry.cardId)) return;
      motion.scale.set(1.06);
    });
    root.on('pointerupoutside', () => {
      if (!isLive(root) || this.wasteFlyer === root) return;
      motion.scale.set(1);
    });
    root.on('pointertap', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      if (!this.isPlayableId(entry.cardId)) return;
      this.onCardClick?.(entry.cardId);
    });
    return entry;
  }

  private replaceCardGraphic(entry: CardSpriteEntry, card: Card, faceUp: boolean): void {
    if (!isLive(entry.motion)) return;
    entry.motion.removeChildren();
    entry.motion.addChild(createCardGraphic(card, faceUp));
  }

  private animateFlip(entry: CardSpriteEntry, card: Card, faceUp: boolean): void {
    const motion = entry.motion;
    if (!isLive(motion)) return;
    entry.flipping = true;
    this.tweens.add(
      tween(
        220,
        (_t, raw) => {
          if (!isLive(motion)) return;
          const squash = raw < 0.5 ? 1 - raw * 2 : (raw - 0.5) * 2;
          motion.scale.x = Math.max(0.08, squash);
          if (raw >= 0.5 && entry.faceUp !== faceUp) {
            this.replaceCardGraphic(entry, card, faceUp);
            entry.faceUp = faceUp;
          }
        },
        () => {
          if (!isLive(motion)) return;
          motion.scale.set(1);
          entry.flipping = false;
          entry.faceUp = faceUp;
          const art = artOf(entry);
          if (art && this.state) {
            const playable = this.isPlayableId(entry.cardId);
            setCardHighlight(art, true, playable, entry.cardId === this.hintCardId);
          }
        },
        easeInOutCubic,
      ),
    );
  }

  private launchToWaste(entry: CardSpriteEntry, waste: Card): void {
    const container = entry.container;
    if (!isLive(container)) return;
    this.wasteFlyer = container;
    container.eventMode = 'none';
    container.cursor = 'default';
    entry.motion.scale.set(1);
    const art = artOf(entry);
    if (art) setCardHighlight(art, false, false, false);
    this.overlayLayer.addChild(container);
    container.zIndex = 80;

    const from = { x: container.x, y: container.y };
    const to = { x: WASTE_POSITION.x, y: WASTE_POSITION.y };
    const spin = from.x < to.x ? 0.18 : -0.18;

    this.animateArc(entry, from, to, 340, spin, layoutWasteScale, () => {
      if (this.wasteFlyer !== container) {
        if (isLive(container)) container.destroy({ children: true });
        return;
      }
      this.settleAsWaste(entry, waste.id);
    });
  }

  private launchDraw(entry: CardSpriteEntry, waste: Card): void {
    const container = entry.container;
    if (!isLive(container)) return;
    this.wasteFlyer = container;
    container.zIndex = 80;
    const from = { x: STOCK_POSITION.x, y: STOCK_POSITION.y };
    const to = { x: WASTE_POSITION.x, y: WASTE_POSITION.y };
    let flipped = false;

    this.animateArc(entry, from, to, 300, 0.12, null, () => {
      if (this.wasteFlyer !== container) {
        if (isLive(container)) container.destroy({ children: true });
        return;
      }
      this.settleAsWaste(entry, waste.id);
    });

    this.tweens.add(
      tween(300, (_t, raw) => {
        if (!isLive(entry.motion)) return;
        if (raw >= 0.42 && !flipped) {
          flipped = true;
          this.replaceCardGraphic(entry, waste, true);
        }
        const squash = raw < 0.42 ? 1 - (raw / 0.42) * 0.88 : Math.min(1, (raw - 0.42) / 0.28);
        entry.motion.scale.x = Math.max(0.1, squash);
        entry.motion.scale.y = 1;
      }),
    );
  }

  private settleAsWaste(entry: CardSpriteEntry, cardId: CardId): void {
    const container = entry.container;
    const existing = this.sprites.get('waste');
    if (existing && existing.container !== container && isLive(existing.container)) {
      existing.container.destroy({ children: true });
    }
    if (!isLive(container)) {
      this.wasteFlyer = null;
      return;
    }
    entry.motion.rotation = 0;
    entry.motion.scale.set(layoutWasteScale);
    this.pilesLayer.addChild(container);
    this.place(container, WASTE_POSITION);
    entry.cardId = cardId;
    entry.slot = 'waste';
    this.sprites.set('waste', entry);
    this.wasteFlyer = null;

    this.tweens.add(
      tween(
        140,
        (t) => {
          if (!isLive(entry.motion)) return;
          const base = layoutWasteScale;
          const squash = base + Math.sin(t * Math.PI) * 0.06;
          entry.motion.scale.set(base + (1 - t) * 0.04, squash);
        },
        () => {
          if (isLive(entry.motion)) entry.motion.scale.set(layoutWasteScale);
        },
        easeOutBack,
      ),
    );
  }

  private animateArc(
    entry: CardSpriteEntry,
    from: { x: number; y: number },
    to: { x: number; y: number },
    durationMs: number,
    spin: number,
    peakScale: number | null,
    onComplete: () => void,
  ): void {
    const container = entry.container;
    const motion = entry.motion;
    if (!isLive(container)) {
      onComplete();
      return;
    }
    const control = {
      x: (from.x + to.x) / 2 + (to.x - from.x) * 0.08,
      y: Math.min(from.y, to.y) - 78,
    };
    this.tweens.add(
      tween(
        durationMs,
        (t) => {
          if (!isLive(container)) return;
          const mt = 1 - t;
          container.x = mt * mt * from.x + 2 * mt * t * control.x + t * t * to.x;
          container.y = mt * mt * from.y + 2 * mt * t * control.y + t * t * to.y;
          motion.rotation = Math.sin(t * Math.PI) * spin;
          if (peakScale != null) {
            const scale = t < 0.55 ? 1 + (peakScale - 1) * (t / 0.55) : peakScale;
            motion.scale.set(scale);
          }
        },
        onComplete,
        easeOutQuart,
      ),
    );
  }
}
