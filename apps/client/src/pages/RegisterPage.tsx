import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthButton, AuthError, AuthInput, AuthLayout } from '../components/AuthLayout';
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
    <AuthLayout title="Create account" subtitle="Join Three Towers Solitaire">
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

      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--color-gold)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
