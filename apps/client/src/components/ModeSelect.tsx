import type { SinglePlayerMode } from '@three-towers/shared';
import { formatMode } from '../lib/format-time';

interface ModeSelectProps {
  onSelect: (mode: SinglePlayerMode) => void;
  isLoading?: boolean;
}

const MODES: Array<{
  id: SinglePlayerMode;
  title: string;
  description: string;
}> = [
  {
    id: 'timed',
    title: 'Timed',
    description: 'Race the clock — every millisecond counts toward your stats.',
  },
  {
    id: 'relaxed',
    title: 'Relaxed',
    description: 'No pressure — play at your own pace with the same rules.',
  },
];

export function ModeSelect({ onSelect, isLoading }: ModeSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Choose a Mode</h2>
        <p className="mt-2 text-white/60">Single-player TriPeaks</p>
        <p className="mt-1 text-xs text-white/40">
          Playing as a guest? Hints and undo are available. Sign in to save games.
        </p>
      </div>

      <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            disabled={isLoading}
            onClick={() => onSelect(mode.id)}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-[var(--color-gold)]/50 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="mb-2 text-xl font-semibold text-[var(--color-gold)]">
              {formatMode(mode.id)}
            </div>
            <p className="text-sm leading-relaxed text-white/70">{mode.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
