import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { SinglePlayerMode } from '@three-towers/shared';
import { HowToPlay } from '../components/HowToPlay';
import { AppBackground } from '../components/layout/AppBackground';
import { LeaderboardPanel } from '../components/LeaderboardPanel';
import { GameButton } from '../components/ui/GameButton';
import { ModeMark } from '../components/ui/ModeMark';
import { ModeTile } from '../components/ui/ModeTile';
import { WeeklyGoals } from '../components/WeeklyGoals';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';

const OTHER_MODES = [
  {
    to: '/daily',
    title: 'Daily',
    description: 'One shared deal',
    mark: 'daily',
    needsAccount: true,
  },
  {
    to: '/multiplayer',
    title: 'Race',
    description: 'Same-seed PvP',
    mark: 'race',
    needsAccount: true,
  },
  {
    to: '/vs-ai',
    title: 'Duel',
    description: 'Race the AI',
    mark: 'duel',
    needsAccount: false,
  },
  {
    to: '/puzzles',
    title: 'Puzzles',
    description: 'Stars & limits',
    mark: 'puzzles',
    needsAccount: false,
  },
] as const;

export default function HomePage() {
  const navigate = useNavigate();
  const { user, tokens, logout, fetchProfile } = useAuthStore();
  const startGame = useGameStore((s) => s.startGame);
  const [showHowto, setShowHowto] = useState(false);
  const [dealing, setDealing] = useState<SinglePlayerMode | null>(null);
  const [dealError, setDealError] = useState<string | null>(null);

  useEffect(() => {
    if (tokens && !user) {
      fetchProfile();
    }
  }, [tokens, user, fetchProfile]);

  const deal = async (mode: SinglePlayerMode) => {
    setDealError(null);
    setDealing(mode);
    try {
      await startGame(mode, tokens?.accessToken);
      navigate('/play');
    } catch (err) {
      setDealError(err instanceof Error ? err.message : 'Could not deal a game');
      setDealing(null);
    }
  };

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
              <GameButton variant="primary" disabled={dealing !== null} onClick={() => deal('relaxed')}>
                {dealing === 'relaxed' ? 'Dealing…' : 'Play'}
              </GameButton>
              <GameButton variant="ghost" onClick={() => logout()}>
                Sign out
              </GameButton>
            </>
          ) : (
            <GameButton variant="primary" onClick={() => navigate('/login')}>
              Get Started
            </GameButton>
          )}
        </div>
      </nav>

      <div className="home-tower">
        <header className="lobby-hero">
          <div className="lobby-hero__lockup">
            <h1 className="lobby-hero__title">
              <span className="lobby-hero__space">SPACE</span>
              <span className="lobby-hero__towers">TOWERS</span>
            </h1>
            <p className="lobby-hero__tagline">Solitaire</p>
          </div>
        </header>

        <div className="home-tower__stack">
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
            <article className="mode-tile mode-tile--featured home-classic">
              <span className="mode-tile__icon">
                <ModeMark name="classic" />
              </span>
              <div>
                <h3 className="mode-tile__title">Classic</h3>
                <div className="home-classic__actions">
                  <GameButton
                    variant="primary"
                    className="home-classic__deal"
                    disabled={dealing !== null}
                    onClick={() => deal('timed')}
                  >
                    {dealing === 'timed' ? 'Dealing…' : 'Timed'}
                  </GameButton>
                  <GameButton
                    variant="secondary"
                    className="home-classic__deal"
                    disabled={dealing !== null}
                    onClick={() => deal('relaxed')}
                  >
                    {dealing === 'relaxed' ? 'Dealing…' : 'Relaxed'}
                  </GameButton>
                </div>
              </div>
            </article>
            {OTHER_MODES.map((mode) => (
              <ModeTile
                key={mode.to}
                to={mode.needsAccount && !user ? `/login?next=${mode.to}` : mode.to}
                title={mode.title}
                mark={mode.mark}
                description={
                  mode.needsAccount && !user
                    ? mode.to === '/daily'
                      ? 'Sign in to play'
                      : 'Sign in to race'
                    : mode.description
                }
              />
            ))}
          </div>

          {dealError && <p className="home-deal-error">{dealError}</p>}

          <WeeklyGoals />

          <p className="home-rule">Ace wraps King. One pass through the stock.</p>

          <div className="home-cta">
            <GameButton
              variant="primary"
              className="home-cta__play"
              disabled={dealing !== null}
              onClick={() => deal('relaxed')}
            >
              {dealing === 'relaxed' ? 'Dealing…' : user ? 'Play' : 'Play free'}
            </GameButton>
            <GameButton variant="ghost" onClick={() => setShowHowto(true)}>
              How to play
            </GameButton>
          </div>

          <LeaderboardPanel mode="timed" />

          <footer className="home-footer">© 2026 Space Towers Solitaire</footer>
        </div>
      </div>
    </AppBackground>
  );
}
