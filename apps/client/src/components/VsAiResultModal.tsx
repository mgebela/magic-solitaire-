import type { VsAiResult } from '@three-towers/shared';
import { formatElapsed } from '../lib/format-time';

interface VsAiResultModalProps {
  result: VsAiResult;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
}

export function VsAiResultModal({
  result,
  onPlayAgain,
  onChangeDifficulty,
}: VsAiResultModalProps) {
  const playerAhead =
    result.playerWon && !result.aiWon
      ? true
      : result.aiWon && !result.playerWon
        ? false
        : result.playerScore > result.aiScore ||
          (result.playerScore === result.aiScore &&
            result.playerElapsedMs < result.aiElapsedMs);

  const headline = playerAhead ? 'You Win!' : 'AI Wins';
  const headlineClass = playerAhead ? 'text-[var(--color-gold)]' : 'text-red-400';

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--color-felt-dark)] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className={`text-4xl font-bold ${headlineClass}`}>{headline}</div>
          <p className="mt-2 text-sm capitalize text-white/60">
            vs {result.difficulty} AI · same seed race
          </p>
        </div>

        <div className="space-y-3 rounded-xl bg-white/5 p-4 text-sm">
          <CompareRow
            label="You"
            score={result.playerScore}
            elapsedMs={result.playerElapsedMs}
            won={result.playerWon}
            highlight={playerAhead}
          />
          <CompareRow
            label={`${result.difficulty} AI`}
            score={result.aiScore}
            elapsedMs={result.aiElapsedMs}
            won={result.aiWon}
            highlight={!playerAhead}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 rounded-lg bg-[var(--color-gold)] py-3 font-semibold text-black transition hover:brightness-110"
          >
            Rematch
          </button>
          <button
            type="button"
            onClick={onChangeDifficulty}
            className="flex-1 rounded-lg border border-white/10 py-3 font-semibold text-white/80 transition hover:bg-white/5"
          >
            Change Difficulty
          </button>
        </div>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  score,
  elapsedMs,
  won,
  highlight,
}: {
  label: string;
  score: number;
  elapsedMs: number;
  won: boolean;
  highlight: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2 ${
        highlight ? 'bg-[var(--color-gold)]/10' : 'bg-black/20'
      }`}
    >
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-xs capitalize text-white/40">{won ? 'cleared board' : 'finished'}</div>
      </div>
      <div className="text-right">
        <div className={`font-semibold ${highlight ? 'text-[var(--color-gold)]' : 'text-white'}`}>
          {score}
        </div>
        <div className="font-mono text-xs text-white/40">{formatElapsed(elapsedMs)}</div>
      </div>
    </div>
  );
}
