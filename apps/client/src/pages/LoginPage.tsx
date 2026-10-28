import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthButton, AuthError, AuthInput, AuthLayout } from '../components/AuthLayout';
import { WalletSignInButton } from '../components/WalletSignInButton';
import { returnPath, returnPathNote } from '../lib/return-path';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = returnPath(params.get('next'));
  const nextNote = returnPathNote(next);
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      navigate(next);
    } catch {
      // error stored in zustand
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle={nextNote ?? 'Welcome back to Space Towers'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <AuthButton type="submit" loading={isLoading}>
          Sign in
        </AuthButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" />
        <span>or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <WalletSignInButton onSuccess={() => navigate(next)} />

      <div className="mt-6 space-y-2 text-center text-sm text-white/60">
        <p>
          <Link to="/play" className="text-[var(--color-gold)] hover:underline">
            Play as guest
          </Link>
        </p>
        <p>
          <Link to="/forgot-password" className="text-[var(--color-neon)] hover:underline">
            Forgot password?
          </Link>
        </p>
        <p>
          No account?{' '}
          <Link
            to={next === '/' ? '/register' : `/register?next=${encodeURIComponent(next)}`}
            className="text-[var(--color-neon)] hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
