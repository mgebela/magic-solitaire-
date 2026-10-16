import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HowToPlay } from '../components/HowToPlay';
import { AppBackground } from '../components/layout/AppBackground';
import { LeaderboardPanel } from '../components/LeaderboardPanel';
import { GameButton, GameLink } from '../components/ui/GameButton';
import { ModeTile } from '../components/ui/ModeTile';
import { useAuthStore } from '../stores/authStore';

const MODES = [
  {
    to: '/play',
    title: 'Classic Play',
    description: 'Timed or relaxed solo TriPeaks among the stone towers.',
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
    title: 'Tower Duel',
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
  const [showHowto, setShowHowto] = useState(false);

  useEffect(() => {
    if (tokens && !user) {
      fetchProfile();
    }
  }, [tokens, user, fetchProfile]);

  return (
    <AppBackground variant="home">
      <HowToPlay forceOpen={showHowto} onClose={() => setShowHowto(false)} />
      <div className="lobby">
        <header className="lobby-hero">
          <div className="lobby-hero__lockup">
            <h1 className="lobby-hero__title">
              <span className="lobby-hero__space">SPACE</span>
              <span className="lobby-hero__towers">TOWERS</span>
            </h1>
            <p className="lobby-hero__tagline">Solitaire</p>
          </div>
        </header>

        <div className="lobby-panel mb-6">
          {user ? (
            <div className="lobby-user">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/45">Welcome back</p>
                <Link
                  to="/profile"
                  className="text-xl font-semibold text-white hover:text-[var(--color-neon)]"
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
            <h2 className="mb-4 text-lg font-extrabold tracking-wide text-[var(--color-neon)]">
              How to Play
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed text-white/65">
              <li>• Clear all 28 cards from the three peaks onto the waste pile.</li>
              <li>• Only open (uncovered) cards can be played.</li>
              <li>• Play a card one rank higher or lower than the waste top card.</li>
              <li>• When the waste is empty, any open card can start the pile.</li>
              <li>• Ace and King connect — you can wrap around the deck.</li>
              <li>• Draw from the stock when stuck; one pass only, no reshuffles.</li>
            </ul>
            <GameButton variant="ghost" className="mt-4 w-full" onClick={() => setShowHowto(true)}>
              Show guide
            </GameButton>
          </div>
          <LeaderboardPanel mode="timed" />
        </div>

        <footer className="mt-10 text-center text-xs text-white/35">
          Space Towers Solitaire
        </footer>
      </div>
    </AppBackground>
  );
}
