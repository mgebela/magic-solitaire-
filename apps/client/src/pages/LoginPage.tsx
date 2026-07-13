import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthButton, AuthError, AuthInput, AuthLayout } from '../components/AuthLayout';
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
    <AuthLayout title="Sign in" subtitle="Welcome back to Three Towers">
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

      <div className="mt-6 space-y-2 text-center text-sm text-white/60">
        <p>
          <Link to="/forgot-password" className="text-[var(--color-gold)] hover:underline">
            Forgot password?
          </Link>
        </p>
        <p>
          No account?{' '}
          <Link to="/register" className="text-[var(--color-gold)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
