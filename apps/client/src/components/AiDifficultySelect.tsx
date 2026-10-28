import { AI_OPPONENTS, type AiDifficulty } from '@three-towers/shared';

interface AiDifficultySelectProps {
  onSelect: (difficulty: AiDifficulty) => void;
  isLoading?: boolean;
}

export function AiDifficultySelect({ onSelect, isLoading }: AiDifficultySelectProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <div className="solid-copy">
        <h2 className="page-title">Tower Duel</h2>
        <p className="page-subtitle">Same seeded board — race the computer</p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {AI_OPPONENTS.map((opponent) => (
          <button
            key={opponent.difficulty}
            type="button"
            disabled={isLoading}
            onClick={() => onSelect(opponent.difficulty)}
            className="mode-tile text-left disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div>
              <h3 className="mode-tile__title">{opponent.label}</h3>
              <p className="mode-tile__desc">{opponent.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
