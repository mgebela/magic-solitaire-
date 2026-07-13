import { useEffect, useRef } from 'react';
import type { GameState } from '@three-towers/shared';
import { GameRenderer } from '../renderer';

interface GameCanvasProps {
  state: GameState | null;
  onCardClick?: (cardId: string) => void;
  hintCardId?: string | null;
  className?: string;
}

export function GameCanvas({ state, onCardClick, hintCardId, className }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const prevStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderer = new GameRenderer();
    rendererRef.current = renderer;
    let mounted = true;
    let observer: ResizeObserver | null = null;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.resize(rect.width, rect.height);
    };

    renderer.init(canvas).then(() => {
      if (!mounted) return;
      resize();
      observer = new ResizeObserver(resize);
      observer.observe(container);
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
    rendererRef.current?.setHintCardId(hintCardId ?? null);
  }, [hintCardId]);

  useEffect(() => {
    if (!state || !rendererRef.current) return;
    const animate = prevStateRef.current !== null;
    rendererRef.current.renderState(state, animate);
    prevStateRef.current = state;
  }, [state]);

  return (
    <div ref={containerRef} className={className ?? 'h-full w-full'}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
