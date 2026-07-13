import { useEffect, useRef } from 'react';
import type { GameState } from '@three-towers/shared';
import { GameRenderer } from '../renderer';
import { MagicGameHud } from './game/MagicGameHud';

interface GameCanvasProps {
  state: GameState | null;
  onCardClick?: (cardId: string) => void;
  onDraw?: () => void;
  hintCardId?: string | null;
  hintDraw?: boolean;
  onHint?: () => void;
  onUndo?: () => void;
  allowUndo?: boolean;
  immersive?: boolean;
  roundCurrent?: number;
  roundTotal?: number;
  roundLabel?: string;
  className?: string;
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
  immersive = false,
  roundCurrent,
  roundTotal,
  roundLabel,
  className,
}: GameCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const prevStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const renderer = new GameRenderer();
    rendererRef.current = renderer;
    let mounted = true;
    let observer: ResizeObserver | null = null;

    const resize = () => {
      const rect = frame.getBoundingClientRect();
      renderer.resize(rect.width, rect.height);
    };

    renderer.init(canvas).then(() => {
      if (!mounted) return;
      resize();
      observer = new ResizeObserver(resize);
      observer.observe(frame);
    });

    return () => {
      mounted = false;
      observer?.disconnect();
      renderer.destroy();
      rendererRef.current = null;
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
    if (!state || !rendererRef.current) return;
    const animate = prevStateRef.current !== null;
    rendererRef.current.renderState(state, animate);
    prevStateRef.current = state;
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
            roundCurrent={roundCurrent}
            roundTotal={roundTotal}
            roundLabel={roundLabel}
          />
        )}
      </div>
    </div>
  );
}
