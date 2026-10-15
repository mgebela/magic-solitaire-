import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthButton, AuthError, AuthInput, AuthLayout } from '../components/AuthLayout';
import { WalletSignInButton } from '../components/WalletSignInButton';
import { useAuthStore } from '../stores/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register({ email, username, password });
      navigate('/');
    } catch {
      // error stored in zustand
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join Space Towers Solitaire">
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
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_]+"
          autoComplete="username"
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <AuthButton type="submit" loading={isLoading}>
          Create account
        </AuthButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" />
        <span>or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <WalletSignInButton />

      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--color-neon)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
