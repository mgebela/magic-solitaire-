import { Link } from 'react-router-dom';
import { MagicLogo } from '../graphics/MagicLogo';
import { AppBackground } from './AppBackground';

interface GameShellProps {
  children: React.ReactNode;
  backTo?: string;
  backLabel?: string;
  toolbar?: React.ReactNode;
  actions?: React.ReactNode;
}

export function GameShell({
  children,
  backTo = '/',
  backLabel = 'Lobby',
  toolbar,
  actions,
}: GameShellProps) {
  return (
    <AppBackground variant="game">
      <div className="flex min-h-screen flex-col">
        <header className="game-header">
          <Link to={backTo} className="game-header__back">
            ← {backLabel}
          </Link>

          <Link to="/" className="game-header__brand">
            <MagicLogo size="sm" />
          </Link>

          {toolbar && <div className="game-header__stats">{toolbar}</div>}
          {actions && <div className="game-header__actions">{actions}</div>}
        </header>

        <main className="game-main">{children}</main>
      </div>
    </AppBackground>
  );
}
