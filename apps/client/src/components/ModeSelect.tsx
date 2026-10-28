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
  icon: string;
}> = [
  {
    id: 'timed',
    title: 'Timed',
    icon: '⏱️',
    description: 'Beat the clock — time bonuses reward fast clears.',
  },
  {
    id: 'relaxed',
    title: 'Relaxed',
    icon: '🌿',
    description: 'No pressure. Same rules, your own pace.',
  },
];

export function ModeSelect({ onSelect, isLoading }: ModeSelectProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 py-8">
      <div className="solid-copy">
        <h2 className="page-title">Choose Your Game</h2>
        <p className="page-subtitle">Pick a mode to deal the towers</p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            disabled={isLoading}
            onClick={() => onSelect(mode.id)}
            className="mode-tile text-left disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="mode-tile__icon">{mode.icon}</span>
            <div>
              <h3 className="mode-tile__title">{formatMode(mode.id)}</h3>
              <p className="mode-tile__desc">{mode.description}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="solid-note">
        Playing as a guest? Hints and undo are available. Sign in to save scores.
      </p>
    </div>
  );
}
