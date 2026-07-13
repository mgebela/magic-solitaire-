import { formatElapsed } from '../lib/format-time';

interface GameTimerProps {
  elapsedMs: number;
  mode: string;
  running: boolean;
}

export function GameTimer({ elapsedMs, mode, running }: GameTimerProps) {
  const isTimed = mode === 'timed' || mode === 'daily';

  return (
    <div
      className={`font-mono text-sm tabular-nums ${
        isTimed ? 'text-[var(--color-gold)]' : 'text-white/70'
      }`}
    >
      <span className="text-white/50">{isTimed ? 'Time' : 'Elapsed'}: </span>
      <strong className={running ? '' : 'opacity-80'}>{formatElapsed(elapsedMs)}</strong>
    </div>
  );
}
