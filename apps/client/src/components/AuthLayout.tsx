import { Link } from 'react-router-dom';
import { MagicLogo } from '../components/graphics/MagicLogo';
import { AppBackground } from '../components/layout/AppBackground';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <AppBackground variant="lobby">
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <Link to="/" className="mb-8 block">
          <MagicLogo />
          <span className="mt-2 block text-center font-[family-name:var(--font-display)] text-xl text-[var(--color-gold-light)]">
            Magic Solitaire
          </span>
        </Link>

        <div className="auth-panel">
          <h1 className="mb-1 font-[family-name:var(--font-display)] text-2xl text-[var(--color-gold-light)]">
            {title}
          </h1>
          {subtitle && <p className="mb-6 text-sm text-white/60">{subtitle}</p>}
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
      <span className="mb-1 block text-sm text-white/70">{label}</span>
      <input
        className="w-full rounded-lg border border-white/10 bg-black/25 px-4 py-2.5 text-white placeholder-white/30 outline-none transition focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/30"
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
      className="game-btn game-btn--primary w-full py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {message}
    </div>
  );
}
