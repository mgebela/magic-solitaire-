import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'game-btn game-btn--primary',
  secondary: 'game-btn game-btn--secondary',
  ghost: 'game-btn game-btn--ghost',
  accent: 'game-btn game-btn--accent',
};

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function GameButton({ variant = 'secondary', className = '', ...props }: GameButtonProps) {
  return (
    <button
      type="button"
      className={`${VARIANT_CLASS[variant]} ${className}`.trim()}
      {...props}
    />
  );
}

interface GameLinkProps {
  to: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

export function GameLink({ to, variant = 'secondary', className = '', children }: GameLinkProps) {
  return (
    <Link to={to} className={`${VARIANT_CLASS[variant]} ${className}`.trim()}>
      {children}
    </Link>
  );
}
