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
    title: 'Classic',
    description: 'Timed or relaxed',
    icon: '🃏',
    featured: true,
  },
  {
    to: '/daily',
    title: 'Daily',
    description: 'One shared deal',
    icon: '☀️',
  },
  {
    to: '/multiplayer',
    title: 'Race',
    description: 'Same-seed PvP',
    icon: '👥',
  },
  {
    to: '/vs-ai',
    title: 'Duel',
    description: 'Race the AI',
    icon: '🤖',
  },
  {
    to: '/puzzles',
    title: 'Puzzles',
    description: 'Stars & limits',
    icon: '⭐',
  },
] as const;

const FEATURES = [
  { title: 'Solo & Multiplayer', detail: 'Play alone or race a room' },
  { title: 'Daily Challenge', detail: 'A new shared board each day' },
  { title: 'Tower Duel', detail: 'Same deal against the AI' },
  { title: 'Ace wraps King', detail: 'Classic TriPeaks ranks' },
  { title: 'One-pass stock', detail: 'No reshuffles when stuck' },
  { title: 'Puzzle Towers', detail: 'Stars for tight solutions' },
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

      <nav className="home-nav" aria-label="Main">
        <Link to="/" className="home-nav__brand">
          Space Towers
        </Link>
        <div className="home-nav__actions">
          {user ? (
            <>
              <Link to="/profile" className="home-nav__user">
                {user.username}
              </Link>
              <GameLink to="/play" variant="primary">
                Play
              </GameLink>
              <GameButton variant="ghost" onClick={() => logout()}>
                Sign out
              </GameButton>
            </>
          ) : (
            <>
              <GameLink to="/play" variant="ghost" className="home-nav__guest">
                Play as Guest
              </GameLink>
              <GameLink to="/login" variant="primary">
                Get Started
              </GameLink>
            </>
          )}
        </div>
      </nav>

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

        <p className="home-kicker">Race the three peaks — same deal, highest score wins</p>

        <div className="home-stats" aria-label="Game facts">
          <div className="home-stat">
            <p className="home-stat__value">3</p>
            <p className="home-stat__label">Towers</p>
          </div>
          <div className="home-stat">
            <p className="home-stat__value">28</p>
            <p className="home-stat__label">Cards</p>
          </div>
          <div className="home-stat">
            <p className="home-stat__value">1</p>
            <p className="home-stat__label">Shared seed</p>
          </div>
        </div>

        <div className="home-modes">
          {MODES.map((mode) => (
            <ModeTile key={mode.to} {...mode} />
          ))}
        </div>

        <section className="home-features" aria-labelledby="home-features-title">
          <h2 id="home-features-title" className="home-features__title">
            Everything you need to know
          </h2>
          <ul className="home-features__grid">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="home-feature">
                <p className="home-feature__title">{feature.title}</p>
                <p className="home-feature__detail">{feature.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="home-cta">
          <GameLink to="/play" variant="primary" className="home-cta__play">
            {user ? 'Start Playing' : 'Start Playing Free'}
          </GameLink>
          <GameButton variant="ghost" onClick={() => setShowHowto(true)}>
            How to play
          </GameButton>
        </div>

        <div className="home-board">
          <LeaderboardPanel mode="timed" />
        </div>

        <footer className="home-footer">© 2026 Space Towers Solitaire</footer>
      </div>
    </AppBackground>
  );
}
