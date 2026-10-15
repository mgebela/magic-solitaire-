import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthButton, AuthError, AuthInput, AuthLayout } from '../components/AuthLayout';
import { WalletSignInButton } from '../components/WalletSignInButton';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      navigate('/');
    } catch {
      // error stored in zustand
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to Space Towers">
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

      <WalletSignInButton />

      <div className="mt-6 space-y-2 text-center text-sm text-white/60">
        <p>
          <Link to="/forgot-password" className="text-[var(--color-neon)] hover:underline">
            Forgot password?
          </Link>
        </p>
        <p>
          No account?{' '}
          <Link to="/register" className="text-[var(--color-neon)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
