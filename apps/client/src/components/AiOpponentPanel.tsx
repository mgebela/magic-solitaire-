import type { GameState } from '@three-towers/shared';
import type { AiDifficulty } from '@three-towers/shared';
import { formatElapsed } from '../lib/format-time';

interface AiOpponentPanelProps {
  difficulty: AiDifficulty;
  state: GameState | null;
}

const LABELS: Record<AiDifficulty, string> = {
  easy: 'Easy AI',
  medium: 'Medium AI',
  hard: 'Hard AI',
  expert: 'Expert AI',
};

export function AiOpponentPanel({ difficulty, state }: AiOpponentPanelProps) {
  const status = state?.status ?? 'idle';
  const isThinking = status === 'playing';

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Opponent
        </h2>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
          {LABELS[difficulty]}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/50">Status</span>
          <span className={`capitalize ${status === 'won' ? 'text-[var(--color-gold)]' : 'text-white'}`}>
            {isThinking ? 'Playing…' : status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Score</span>
          <span className="font-mono font-semibold text-white">{state?.score ?? 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Combo</span>
          <span className="font-mono text-[var(--color-gold)]">×{state?.combo || 1}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Cleared</span>
          <span className="font-mono text-white">{state?.foundation.length ?? 0} / 28</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Time</span>
          <span className="font-mono text-white/80">
            {formatElapsed(state?.elapsedMs ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
