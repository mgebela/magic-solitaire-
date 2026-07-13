import { AI_OPPONENTS, type AiDifficulty } from '@three-towers/shared';

interface AiDifficultySelectProps {
  onSelect: (difficulty: AiDifficulty) => void;
  isLoading?: boolean;
}

export function AiDifficultySelect({ onSelect, isLoading }: AiDifficultySelectProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Practice vs AI</h2>
        <p className="mt-2 text-white/60">Same seeded board — race the computer</p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {AI_OPPONENTS.map((opponent) => (
          <button
            key={opponent.difficulty}
            type="button"
            disabled={isLoading}
            onClick={() => onSelect(opponent.difficulty)}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-[var(--color-gold)]/50 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="mb-2 text-xl font-semibold text-[var(--color-gold)]">
              {opponent.label}
            </div>
            <p className="text-sm leading-relaxed text-white/70">{opponent.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
