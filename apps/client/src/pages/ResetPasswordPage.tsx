import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { MessageResponse } from '@three-towers/shared';
import { AuthButton, AuthError, AuthInput, AuthLayout } from '../components/AuthLayout';
import { apiFetch, ApiError } from '../lib/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Missing reset token. Check your email link.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiFetch<MessageResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Reset password">
        <AuthError message="Invalid reset link. Request a new one from the forgot password page." />
        <p className="mt-4 text-center text-sm">
          <Link to="/forgot-password" className="text-[var(--color-gold)] hover:underline">
            Request reset link
          </Link>
        </p>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Password reset">
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Your password has been reset successfully.
        </div>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-[var(--color-gold)] hover:underline">
            Sign in with your new password
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />
        <AuthInput
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <AuthButton type="submit" loading={loading}>
          Reset password
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
