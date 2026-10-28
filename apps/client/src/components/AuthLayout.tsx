import { Link } from 'react-router-dom';
import { AppBackground } from '../components/layout/AppBackground';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <AppBackground variant="home">
      <div className="auth-page">
        <header className="lobby-hero">
          <Link to="/" className="lobby-hero__lockup" aria-label="Space Towers home">
            <span className="lobby-hero__title">
              <span className="lobby-hero__space">SPACE</span>
              <span className="lobby-hero__towers">TOWERS</span>
            </span>
            <span className="lobby-hero__tagline">Solitaire</span>
          </Link>
        </header>

        <div className="auth-panel">
          <h1 className="page-title mb-1 !text-4xl">{title}</h1>
          {subtitle && <p className="page-subtitle mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </AppBackground>
  );
}

export function AuthInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-white/90">{label}</span>
      <input
        className="stone-input px-4 py-3 placeholder-white/30 transition"
        {...props}
      />
    </label>
  );
}

export function AuthButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className="game-btn game-btn--primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  const offerGuest = /play as a guest|offline/i.test(message);
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      <p>{message}</p>
      {offerGuest && (
        <Link
          to="/play"
          className="mt-2 inline-block font-semibold text-[var(--color-gold)] hover:underline"
        >
          Play as guest →
        </Link>
      )}
    </div>
  );
}
