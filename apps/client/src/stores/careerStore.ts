import { create } from 'zustand';
import type { GameState } from '@three-towers/shared';
import { clearedPeakCount } from '@three-towers/game-engine';

const KEY = 'space-towers-career';
const DAY = 24 * 60 * 60 * 1000;

export const RELICS_PER_RANK = 3;
export const MAX_RANK = 10;

export function rankFromRelics(relics: number): number {
  return Math.min(MAX_RANK, Math.floor(Math.max(0, relics) / RELICS_PER_RANK));
}

export interface Goal {
  id: 'score' | 'wins' | 'chain';
  title: string;
  detail: string;
  badge: string;
  target: number;
  progress: number;
  windowMs: number;
  startedAt: number;
  earned: boolean;
}

interface CareerData {
  relics: number;
  badges: string[];
  credited: string[];
  chainKeys: string[];
  goals: Goal[];
}

interface CareerStore extends CareerData {
  creditGame: (state: GameState) => void;
  noteChain: (state: GameState) => void;
}

function defaultGoals(now = Date.now()): Goal[] {
  return [
    {
      id: 'score',
      title: 'Score 2,000',
      detail: 'In one week',
      badge: 'High Score',
      target: 2000,
      progress: 0,
      windowMs: 7 * DAY,
      startedAt: now,
      earned: false,
    },
    {
      id: 'wins',
      title: 'Win 10 deals',
      detail: 'In two weeks',
      badge: 'Ten Wins',
      target: 10,
      progress: 0,
      windowMs: 14 * DAY,
      startedAt: now,
      earned: false,
    },
    {
      id: 'chain',
      title: 'Hit a 5-chain',
      detail: 'Three times this week',
      badge: 'Blaze',
      target: 3,
      progress: 0,
      windowMs: 7 * DAY,
      startedAt: now,
      earned: false,
    },
  ];
}

function refreshGoal(goal: Goal, badges: string[], now: number): { goal: Goal; badges: string[] } {
  if (now < goal.startedAt + goal.windowMs) return { goal, badges };
  const nextBadges = goal.earned && !badges.includes(goal.badge) ? [...badges, goal.badge] : badges;
  return {
    badges: nextBadges,
    goal: { ...goal, progress: 0, earned: false, startedAt: now },
  };
}

function withProgress(goal: Goal, add: number, badges: string[]): { goal: Goal; badges: string[] } {
  const progress = Math.min(goal.target, goal.progress + add);
  const earned = progress >= goal.target;
  const nextBadges = earned && !badges.includes(goal.badge) ? [...badges, goal.badge] : badges;
  return { goal: { ...goal, progress, earned }, badges: nextBadges };
}

function fresh(): CareerData {
  return { relics: 0, badges: [], credited: [], chainKeys: [], goals: defaultGoals() };
}

function load(): CareerData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const saved = JSON.parse(raw) as Partial<CareerData>;
    const now = Date.now();
    let badges = saved.badges ?? [];
    const goals = defaultGoals(now).map((goal) => {
      const prev = saved.goals?.find((item) => item.id === goal.id);
      const merged = prev
        ? {
            ...goal,
            progress: prev.progress,
            startedAt: prev.startedAt,
            earned: prev.earned,
          }
        : goal;
      const refreshed = refreshGoal(merged, badges, now);
      badges = refreshed.badges;
      return refreshed.goal;
    });
    return {
      relics: saved.relics ?? 0,
      badges,
      credited: saved.credited ?? [],
      chainKeys: saved.chainKeys ?? [],
      goals,
    };
  } catch {
    return fresh();
  }
}

function save(data: CareerData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const useCareerStore = create<CareerStore>((set, get) => ({
  ...load(),

  creditGame: (state) => {
    const key = `${state.seed}:${state.mode}:${state.moves.length}:${state.status}`;
    const current = get();
    if (current.credited.includes(key)) return;
    if (state.status !== 'won' && state.status !== 'lost') return;

    const now = Date.now();
    let badges = current.badges;
    let goals = current.goals.map((goal) => {
      const refreshed = refreshGoal(goal, badges, now);
      badges = refreshed.badges;
      return refreshed.goal;
    });

    const scoreGoal = goals.find((goal) => goal.id === 'score');
    const winsGoal = goals.find((goal) => goal.id === 'wins');
    if (scoreGoal) {
      const next = withProgress(scoreGoal, state.score, badges);
      badges = next.badges;
      goals = goals.map((goal) => (goal.id === 'score' ? next.goal : goal));
    }
    if (winsGoal && state.status === 'won') {
      const next = withProgress(winsGoal, 1, badges);
      badges = next.badges;
      goals = goals.map((goal) => (goal.id === 'wins' ? next.goal : goal));
    }

    const data: CareerData = {
      relics: current.relics + clearedPeakCount(state.tableau),
      badges,
      credited: [...current.credited, key].slice(-80),
      chainKeys: current.chainKeys,
      goals,
    };
    save(data);
    set(data);
  },

  noteChain: (state) => {
    const key = `${state.seed}:${state.moves.length}`;
    const current = get();
    if (current.chainKeys.includes(key)) return;

    const now = Date.now();
    let badges = current.badges;
    let goals = current.goals.map((goal) => {
      const refreshed = refreshGoal(goal, badges, now);
      badges = refreshed.badges;
      return refreshed.goal;
    });
    const chain = goals.find((goal) => goal.id === 'chain');
    if (chain && !chain.earned) {
      const next = withProgress(chain, 1, badges);
      badges = next.badges;
      goals = goals.map((goal) => (goal.id === 'chain' ? next.goal : goal));
    }

    const data: CareerData = {
      relics: current.relics,
      badges,
      credited: current.credited,
      chainKeys: [...current.chainKeys, key].slice(-80),
      goals,
    };
    save(data);
    set(data);
  },
}));
