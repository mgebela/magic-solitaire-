import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mb-8 text-center">
        <Link to="/" className="text-3xl font-bold text-[var(--color-gold)] hover:opacity-80">
          Three Towers Solitaire
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/20 p-8 backdrop-blur-sm">
        <h1 className="mb-1 text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mb-6 text-sm text-white/60">{subtitle}</p>}
        {children}
      </div>
    </div>
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
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/30"
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
      className="w-full rounded-lg bg-[var(--color-gold)] px-4 py-2.5 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
