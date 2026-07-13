import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagicLogo } from '../components/graphics/MagicLogo';
import { AppBackground } from '../components/layout/AppBackground';
import { LeaderboardPanel } from '../components/LeaderboardPanel';
import { GameButton, GameLink } from '../components/ui/GameButton';
import { ModeTile } from '../components/ui/ModeTile';
import { useAuthStore } from '../stores/authStore';

const MODES = [
  {
    to: '/play',
    title: 'Classic Play',
    description: 'Timed or relaxed solo TriPeaks on the green felt.',
    icon: '🃏',
    featured: true,
  },
  {
    to: '/daily',
    title: 'Daily Challenge',
    description: 'One shared board worldwide — compete on today’s leaderboard.',
    icon: '☀️',
  },
  {
    to: '/vs-ai',
    title: 'Magic Duel',
    description: 'Race the AI on the same deal. Four difficulty levels.',
    icon: '🤖',
  },
  {
    to: '/puzzles',
    title: 'Puzzle Towers',
    description: 'Curated layouts with move limits and star ratings.',
    icon: '⭐',
  },
  {
    to: '/multiplayer',
    title: 'Multiplayer',
    description: 'Join a room and race up to 4 players on identical seeds.',
    icon: '👥',
  },
] as const;

export default function HomePage() {
  const { user, tokens, logout, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (tokens && !user) {
      fetchProfile();
    }
  }, [tokens, user, fetchProfile]);

  return (
    <AppBackground variant="lobby">
      <div className="lobby">
        <header className="lobby-hero">
          <MagicLogo className="mx-auto" />
          <h1 className="lobby-hero__title">Magic Solitaire</h1>
          <p className="lobby-hero__tagline">
            Clear the three towers. Chain combos. Chase the high score.
          </p>
        </header>

        <div className="lobby-panel mb-6">
          {user ? (
            <div className="lobby-user">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/45">Welcome back</p>
                <Link
                  to="/profile"
                  className="text-xl font-semibold text-white hover:text-[var(--color-gold-light)]"
                >
                  {user.username}
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                <GameLink to="/profile" variant="accent">
                  Profile
                </GameLink>
                <GameButton variant="ghost" onClick={() => logout()}>
                  Sign out
                </GameButton>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <GameLink to="/play" variant="primary" className="flex-1 py-3">
                Play as Guest
              </GameLink>
              <GameLink to="/login" variant="secondary" className="flex-1 py-3">
                Sign in
              </GameLink>
              <GameLink to="/register" variant="ghost" className="flex-1 py-3">
                Register
              </GameLink>
            </div>
          )}

          <div className="mode-grid">
            {MODES.map((mode) => (
              <ModeTile key={mode.to} {...mode} />
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lobby-panel">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg text-[var(--color-gold-light)]">
              How to Play
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed text-white/65">
              <li>• Play cards one rank higher or lower than the waste pile.</li>
              <li>• Clear all 28 tableau cards before the stock runs out.</li>
              <li>• Chain plays to build combos and boost your score.</li>
              <li>• Ace and King connect — wrap around the deck!</li>
            </ul>
          </div>
          <LeaderboardPanel mode="timed" />
        </div>

        <footer className="mt-10 text-center text-xs text-white/35">
          Magic Solitaire — TriPeaks on the green felt
        </footer>
      </div>
    </AppBackground>
  );
}
