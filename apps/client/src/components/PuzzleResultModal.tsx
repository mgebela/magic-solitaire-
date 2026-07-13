import type { PuzzleResult } from '@three-towers/shared';
import { StarRating } from './StarRating';

interface PuzzleResultModalProps {
  result: PuzzleResult;
  title: string;
  onRetry: () => void;
  onBack: () => void;
}

export function PuzzleResultModal({ result, title, onRetry, onBack }: PuzzleResultModalProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--color-felt-dark)] p-8 text-center shadow-2xl">
        <div className={`text-3xl font-bold ${result.won ? 'text-[var(--color-gold)]' : 'text-red-400'}`}>
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 rounded-lg bg-[var(--color-gold)] py-3 font-semibold text-black hover:brightness-110"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-lg border border-white/10 py-3 font-semibold text-white/80 hover:bg-white/5"
          >
            Puzzle List
          </button>
        </div>
      </div>
    </div>
  );
}
