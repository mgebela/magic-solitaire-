import type { GameConfig } from './game';

export type AiDifficulty = NonNullable<GameConfig['difficulty']>;

export interface AiOpponentInfo {
  difficulty: AiDifficulty;
  label: string;
  description: string;
}

export const AI_OPPONENTS: AiOpponentInfo[] = [
  {
    difficulty: 'easy',
    label: 'Easy',
    description: 'Makes mistakes and thinks slowly — great for learning.',
  },
  {
    difficulty: 'medium',
    label: 'Medium',
    description: 'Solid fundamentals with occasional misplays.',
  },
  {
    difficulty: 'hard',
    label: 'Hard',
    description: 'Prioritizes unblocking cards and keeping combos.',
  },
  {
    difficulty: 'expert',
    label: 'Expert',
    description: 'Plans ahead and plays fast — a serious challenge.',
  },
];

export interface VsAiResult {
  playerWon: boolean;
  aiWon: boolean;
  playerScore: number;
  aiScore: number;
  playerElapsedMs: number;
  aiElapsedMs: number;
  difficulty: AiDifficulty;
}
