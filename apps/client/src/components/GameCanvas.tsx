import { useEffect, useRef } from 'react';
import type { GameState } from '@three-towers/shared';
import { GameRenderer } from '../renderer';
import { useCareerStore } from '../stores/careerStore';
import { MagicGameHud, type RaceLane } from './game/MagicGameHud';

/** Serialize Pixi inits so React StrictMode cannot attach two Applications to one canvas. */
let canvasInitQueue: Promise<void> = Promise.resolve();

function boardSignature(state: GameState): string {
  const tableau = state.tableau
    .map((card) => (card ? `${card.id}:${state.uncovered.includes(card.id) ? 1 : 0}` : '.'))
    .join('');
  return `${state.status}|${state.moves.length}|${state.score}|${state.combo}|${state.waste?.id ?? ''}|${state.stock.length}|${tableau}`;
}

interface GameCanvasProps {
  state: GameState | null;
  onCardClick?: (cardId: string) => void;
  onDraw?: () => void;
  hintCardId?: string | null;
  hintDraw?: boolean;
  onHint?: () => void;
  onUndo?: () => void;
  allowUndo?: boolean;
  canUndo?: boolean;
  immersive?: boolean;
  roundCurrent?: number;
  roundTotal?: number;
  roundLabel?: string;
  roundValue?: string;
  race?: RaceLane[];
  exitTo?: string;
  onExit?: () => void;
  className?: string;
  wildArmed?: boolean;
  onArmWild?: () => void;
  onKeepWild?: () => void;
  onDiscardWild?: () => void;
}

export function GameCanvas({
  state,
  onCardClick,
  onDraw,
  hintCardId,
  hintDraw,
  onHint,
  onUndo,
  allowUndo,
  canUndo,
  immersive = false,
  roundCurrent,
  roundTotal,
  roundLabel,
  roundValue,
  race,
  exitTo,
  onExit,
  className,
  wildArmed,
  onArmWild,
  onKeepWild,
  onDiscardWild,
}: GameCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const prevStateRef = useRef<GameState | null>(null);
  const boardKeyRef = useRef<string>('');
  const comboRef = useRef(0);
  const creditGame = useCareerStore((s) => s.creditGame);
  const noteChain = useCareerStore((s) => s.noteChain);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const renderer = new GameRenderer();
    rendererRef.current = renderer;
    prevStateRef.current = null;
    boardKeyRef.current = '';
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    const resize = () => {
      const rect = frame.getBoundingClientRect();
      renderer.resize(rect.width, rect.height);
    };

    canvasInitQueue = canvasInitQueue.then(async () => {
      if (cancelled) return;
      try {
        await renderer.init(canvas);
      } catch {
        if (!cancelled) {
          renderer.destroy();
        }
        return;
      }
      if (cancelled) {
        renderer.destroy();
        return;
      }
      resize();
      observer = new ResizeObserver(resize);
      observer.observe(frame);
      const latest = prevStateRef.current;
      if (latest) {
        renderer.renderState(latest, false);
        boardKeyRef.current = boardSignature(latest);
      }
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      renderer.destroy();
      if (rendererRef.current === renderer) {
        rendererRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setOnCardClick(onCardClick ?? null);
  }, [onCardClick]);

  useEffect(() => {
    rendererRef.current?.setOnDrawClick(onDraw ?? null);
  }, [onDraw]);

  useEffect(() => {
    rendererRef.current?.setHintCardId(hintCardId ?? null);
  }, [hintCardId]);

  useEffect(() => {
    if (!state) return;
    if (state.combo >= 5 && comboRef.current < 5) noteChain(state);
    comboRef.current = state.combo;
    if (state.status === 'won' || state.status === 'lost') creditGame(state);
  }, [state, creditGame, noteChain]);

  useEffect(() => {
    if (!state || !rendererRef.current) return;
    const key = boardSignature(state);
    if (key === boardKeyRef.current) return;
    const animate = prevStateRef.current !== null;
    rendererRef.current.renderState(state, animate);
    prevStateRef.current = state;
    boardKeyRef.current = key;
  }, [state]);

  return (
    <div ref={stageRef} className={`game-stage ${className ?? ''}`.trim()}>
      <div ref={frameRef} className="game-stage__frame">
        <canvas ref={canvasRef} className="game-stage__canvas" />
        {immersive && state && onDraw && (
          <MagicGameHud
            state={state}
            onDraw={onDraw}
            drawDisabled={state.status !== 'playing' || state.stock.length === 0}
            hintDraw={hintDraw}
            onHint={onHint}
            onUndo={onUndo}
            allowUndo={allowUndo}
            canUndo={canUndo}
            roundCurrent={roundCurrent}
            roundTotal={roundTotal}
            roundLabel={roundLabel}
            roundValue={roundValue}
            race={race}
            exitTo={exitTo}
            onExit={onExit}
            wildArmed={wildArmed}
            onArmWild={onArmWild}
            onKeepWild={onKeepWild}
            onDiscardWild={onDiscardWild}
          />
        )}
      </div>
    </div>
  );
}
