import type { GameStats, ScoreBreakdown } from '@three-towers/shared';
import { formatElapsed, formatMode } from '../lib/format-time';

interface GameResultModalProps {
  stats: GameStats;
  persisted: boolean;
  onPlayAgain: () => void;
  onChangeMode: () => void;
}

export function GameResultModal({
  stats,
  persisted,
  onPlayAgain,
  onChangeMode,
}: GameResultModalProps) {
  const won = stats.status === 'won';

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto lobby-panel p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div
            className={`text-4xl font-bold ${won ? 'text-[var(--color-gold)]' : 'text-red-400'}`}
          >
            {won ? 'You Win!' : 'Game Over'}
          </div>
          <p className="mt-2 text-sm text-white/60">
            {formatMode(stats.mode)} mode
            {persisted ? ' · Saved to your account' : ' · Guest session (not saved)'}
          </p>
          {stats.isPersonalBest && won && (
            <p className="mt-2 text-sm font-semibold text-[var(--color-gold)]">
              New personal best!
            </p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-4 rounded-xl bg-white/5 p-4 text-sm">
          <Stat label="Score" value={stats.score} highlight />
          <Stat label="Time" value={formatElapsed(stats.elapsedMs)} mono />
          <Stat label="Moves" value={stats.movesCount} />
          <Stat label="Cards cleared" value={`${stats.cardsCleared} / 28`} />
          <Stat label="Best combo" value={`×${stats.maxCombo || 1}`} />
          <Stat label="Stock left" value={stats.stockRemaining} />
        </dl>

        {stats.scoreBreakdown && won && (
          <ScoreBreakdownPanel breakdown={stats.scoreBreakdown} />
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 rounded-lg bg-[var(--color-gold)] py-3 font-semibold text-black transition hover:brightness-110"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={onChangeMode}
            className="flex-1 rounded-lg border border-white/10 py-3 font-semibold text-white/80 transition hover:bg-white/5"
          >
            Change Mode
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreBreakdownPanel({ breakdown }: { breakdown: ScoreBreakdown }) {
  const rows: Array<{ label: string; value: number; show?: boolean }> = [
    { label: 'Cards removed', value: breakdown.cardsRemoved },
    { label: 'Combo bonus', value: breakdown.comboBonus, show: breakdown.comboBonus > 0 },
    { label: 'Stock bonus', value: breakdown.stockRemaining, show: breakdown.stockRemaining > 0 },
    { label: 'Time bonus', value: breakdown.timeBonus, show: breakdown.timeBonus > 0 },
    {
      label: 'Perfect game',
      value: breakdown.perfectGameBonus,
      show: breakdown.perfectGameBonus > 0,
    },
    { label: 'Fast moves', value: breakdown.fastMoveBonus, show: breakdown.fastMoveBonus > 0 },
    { label: 'No undo', value: breakdown.noUndoBonus, show: breakdown.noUndoBonus > 0 },
    {
      label: 'Difficulty',
      value: breakdown.difficultyBonus,
      show: breakdown.difficultyBonus > 0,
    },
  ];

  return (
    <div className="mt-4 rounded-xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-gold)]">Score Breakdown</h3>
      <dl className="space-y-2 text-sm">
        {rows
          .filter((row) => row.show !== false && row.value > 0)
          .map((row) => (
            <div key={row.label} className="flex justify-between text-white/80">
              <dt>{row.label}</dt>
              <dd className="font-mono font-semibold text-white">+{row.value}</dd>
            </div>
          ))}
        <div className="flex justify-between border-t border-white/10 pt-2 font-semibold text-white">
          <dt>Total</dt>
          <dd className="font-mono text-[var(--color-gold)]">{breakdown.total}</dd>
        </div>
      </dl>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-white/50">{label}</dt>
      <dd
        className={`text-lg font-semibold ${highlight ? 'text-[var(--color-gold)]' : 'text-white'} ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
