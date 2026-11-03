import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { SinglePlayerMode } from '@three-towers/shared';
import { HowToPlay } from '../components/HowToPlay';
import { AppBackground } from '../components/layout/AppBackground';
import { LeaderboardPanel } from '../components/LeaderboardPanel';
import { GameButton } from '../components/ui/GameButton';
import { ModeTile } from '../components/ui/ModeTile';
import { WeeklyGoals } from '../components/WeeklyGoals';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';

const LEFT_MODES = [
  {
    to: '/daily',
    title: 'Daily',
    description: 'One shared deal',
    needsAccount: true,
  },
  {
    to: '/multiplayer',
    title: 'Race',
    description: 'Same-seed PvP',
    needsAccount: true,
  },
] as const;

const RIGHT_MODES = [
  {
    to: '/vs-ai',
    title: 'Duel',
    description: 'Race the AI',
    needsAccount: false,
  },
  {
    to: '/puzzles',
    title: 'Puzzles',
    description: 'Stars & limits',
    needsAccount: false,
  },
] as const;

type HomeMode = (typeof LEFT_MODES)[number] | (typeof RIGHT_MODES)[number];

function modeTileProps(mode: HomeMode, signedIn: boolean) {
  const needsSignIn = mode.needsAccount && !signedIn;
  return {
    to: needsSignIn ? `/login?next=${mode.to}` : mode.to,
    title: mode.title,
    description: needsSignIn
      ? mode.to === '/daily'
        ? 'Sign in to play'
        : 'Sign in to race'
      : mode.description,
  };
}

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

        <div className="home-plays">
          <div className="home-plays__col">
            <article className="mode-tile mode-tile--featured home-classic">
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
            {LEFT_MODES.map((mode) => (
              <ModeTile key={mode.to} {...modeTileProps(mode, Boolean(user))} />
            ))}
          </div>
          <div className="home-plays__col">
            {RIGHT_MODES.map((mode) => (
              <ModeTile key={mode.to} {...modeTileProps(mode, Boolean(user))} />
            ))}
          </div>
        </div>

        <div className="home-tower__stack">
          {dealError && <p className="home-deal-error">{dealError}</p>}

          <LeaderboardPanel accessToken={tokens?.accessToken} userId={user?.id} />

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

          <footer className="home-footer">© 2026 Space Towers Solitaire</footer>
        </div>
      </div>
    </AppBackground>
  );
}
