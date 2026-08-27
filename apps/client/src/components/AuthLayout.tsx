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
          <span className="mt-2 block text-center font-[family-name:var(--font-logo)] text-2xl tracking-wide text-white">
            SPACE TOWERS
          </span>
        </Link>

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
      <span className="mb-1 block text-sm text-white/70">{label}</span>
      <input
        className="stone-input px-4 py-2.5 placeholder-white/30 transition"
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
