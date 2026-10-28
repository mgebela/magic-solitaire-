import type { PuzzleResult } from '@three-towers/shared';
import { GuestAdSlot } from './ads/GuestAdSlot';
import { StarRating } from './StarRating';

interface PuzzleResultModalProps {
  result: PuzzleResult;
  title: string;
  onRetry: () => void;
  onBack: () => void;
}

export function PuzzleResultModal({ result, title, onRetry, onBack }: PuzzleResultModalProps) {
  return (
    <div className="result-shade absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className={`result-panel lobby-panel w-full max-w-md p-8 text-center shadow-2xl ${result.won ? 'result-panel--win' : ''}`}>
        <div className={`result-title font-[family-name:var(--font-display)] text-3xl ${result.won ? 'text-[var(--color-gold)]' : 'text-red-400'}`}>
          {result.won ? 'Puzzle Complete!' : 'Out of Moves'}
        </div>
        <p className="mt-2 text-sm text-white/60">{title}</p>

        <div className="my-6 flex justify-center">
          <StarRating stars={result.stars} />
        </div>

        {result.isNewBest && result.stars > 0 && (
          <p className="mb-4 text-sm font-semibold text-[var(--color-gold)]">New best!</p>
        )}

        <dl className="grid grid-cols-2 gap-4 rounded-xl bg-white/5 p-4 text-sm">
          <div>
            <dt className="text-white/50">Moves used</dt>
            <dd className="font-mono text-lg font-semibold text-white">
              {result.movesUsed} / {result.moveLimit}
            </dd>
          </div>
          <div>
            <dt className="text-white/50">Result</dt>
            <dd className="text-lg font-semibold capitalize text-white">
              {result.won ? 'Cleared' : 'Failed'}
            </dd>
          </div>
        </dl>

        <GuestAdSlot slot="result" className="mt-5" />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="game-btn game-btn--primary flex-1 py-3"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={onBack}
            className="game-btn game-btn--ghost flex-1 py-3"
          >
            Puzzle List
          </button>
        </div>
      </div>
    </div>
  );
}
