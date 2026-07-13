import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TRIPEAKS_TABLEAU_CARD_COUNT,
  TRIPEAKS_STOCK_CARD_COUNT,
  TRIPEAKS_TOTAL_CARD_COUNT,
} from '@three-towers/shared';
import { ENGINE_VERSION } from '@three-towers/game-engine';
import { LeaderboardPanel } from '../components/LeaderboardPanel';
import { useAuthStore } from '../stores/authStore';

export default function HomePage() {
  const { user, tokens, logout, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (tokens && !user) {
      fetchProfile();
    }
  }, [tokens, user, fetchProfile]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <header className="mb-12 text-center">
        <h1 className="mb-2 text-5xl font-bold tracking-tight text-[var(--color-gold)]">
          Three Towers Solitaire
        </h1>
        <p className="text-lg text-white/70">TriPeaks solitaire — Milestone 14</p>
      </header>

      <main className="w-full max-w-4xl rounded-2xl border border-white/10 bg-black/20 p-8 backdrop-blur-sm">
        {user ? (
          <div className="mb-8 space-y-4 rounded-xl bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Signed in as</p>
                <Link
                  to="/profile"
                  className="text-lg font-semibold text-white hover:text-[var(--color-gold)]"
                >
                  {user.username}
                </Link>
                <p className="text-sm text-white/60">{user.email}</p>
              </div>
              <button
                onClick={() => logout()}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
              >
                Sign out
              </button>
            </div>
            <Link
              to="/profile"
              className="block rounded-lg border border-[var(--color-gold)]/30 py-3 text-center font-semibold text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
            >
              My Profile
            </Link>
            <Link
              to="/play"
              className="block rounded-lg bg-[var(--color-gold)] py-3 text-center font-semibold text-black hover:brightness-110"
            >
              Play Solo
            </Link>
            <Link
              to="/daily"
              className="block rounded-lg border border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10 py-3 text-center font-semibold text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20"
            >
              Daily Challenge
            </Link>
            <Link
              to="/vs-ai"
              className="block rounded-lg border border-white/10 py-3 text-center font-semibold text-white/80 hover:bg-white/5"
            >
              Practice vs AI
            </Link>
            <Link
              to="/puzzles"
              className="block rounded-lg border border-white/10 py-3 text-center font-semibold text-white/80 hover:bg-white/5"
            >
              Puzzle Mode
            </Link>
            <Link
              to="/multiplayer"
              className="block rounded-lg border border-[var(--color-gold)]/30 py-3 text-center font-semibold text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
            >
              Multiplayer
            </Link>
          </div>
        ) : (
          <div className="mb-8 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/play"
                className="flex-1 rounded-lg bg-[var(--color-gold)] py-3 text-center font-semibold text-black hover:brightness-110"
              >
                Play Solo
              </Link>
              <Link
                to="/daily"
                className="flex-1 rounded-lg border border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10 py-3 text-center font-semibold text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20"
              >
                Daily
              </Link>
              <Link
                to="/vs-ai"
                className="flex-1 rounded-lg border border-white/10 py-3 text-center font-semibold text-white/80 hover:bg-white/5"
              >
                vs AI
              </Link>
              <Link
                to="/puzzles"
                className="flex-1 rounded-lg border border-white/10 py-3 text-center font-semibold text-white/80 hover:bg-white/5"
              >
                Puzzles
              </Link>
              <Link
                to="/multiplayer"
                className="flex-1 rounded-lg border border-[var(--color-gold)]/30 py-3 text-center font-semibold text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
              >
                Multiplayer
              </Link>
            </div>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-center font-semibold text-white/80 hover:bg-white/5"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-center font-semibold text-white/80 hover:bg-white/5"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        <h2 className="mb-6 text-xl font-semibold">Project Status</h2>

        <ul className="space-y-3 text-white/80">
          <StatusItem done label="Monorepo structure (Turborepo + npm workspaces)" />
          <StatusItem done label="Shared types package (@three-towers/shared)" />
          <StatusItem done label="Game engine package stub (@three-towers/game-engine)" />
          <StatusItem done label="React 19 client (Vite + TailwindCSS)" />
          <StatusItem done label="NestJS server" />
          <StatusItem done label="Authentication (JWT, email login, OAuth stubs)" />
          <StatusItem done label="Database / Prisma (PostgreSQL)" />
          <StatusItem done label="Game engine (seeded shuffle, move validation)" />
          <StatusItem done label="Card rendering with PixiJS" />
          <StatusItem done label="Single player (timed / relaxed, persistence)" />
          <StatusItem done label="Scoring system (bonuses, leaderboard)" />
          <StatusItem done label="Multiplayer (Socket.io rooms, same-seed races)" />
          <StatusItem done label="AI opponents (practice vs AI)" />
          <StatusItem done label="Daily challenge (shared seed, leaderboard)" />
          <StatusItem done label="Puzzle mode (curated layouts, stars)" />
          <StatusItem done label="Undo & hints (solo play assistance)" />
          <StatusItem done label="Player profile & statistics" />
          <StatusItem done label="Docker deployment (Compose stack)" />
        </ul>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-white/5 p-4 text-sm">
            <Stat label="Tableau cards" value={TRIPEAKS_TABLEAU_CARD_COUNT} />
            <Stat label="Stock cards" value={TRIPEAKS_STOCK_CARD_COUNT} />
            <Stat label="Total deck" value={TRIPEAKS_TOTAL_CARD_COUNT} />
            <Stat label="Engine version" value={ENGINE_VERSION} />
          </div>
          <LeaderboardPanel mode="timed" />
        </div>
      </main>

      <footer className="mt-8 text-sm text-white/40">
        Milestone 14 complete — project milestones finished
      </footer>
    </div>
  );
}

function StatusItem({ done = false, label }: { done?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
          done ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
        }`}
      >
        {done ? '✓' : '·'}
      </span>
      {label}
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-white/50">{label}</div>
      <div className="text-lg font-mono font-semibold">{value}</div>
    </div>
  );
}
