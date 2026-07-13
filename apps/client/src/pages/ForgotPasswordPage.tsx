import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MessageResponse } from '@three-towers/shared';
import { AuthButton, AuthError, AuthInput, AuthLayout } from '../components/AuthLayout';
import { apiFetch, ApiError } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiFetch<MessageResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(response.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="We'll send you a reset link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />
        {success && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {success}
          </div>
        )}
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthButton type="submit" loading={loading}>
          Send reset link
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        <Link to="/login" className="text-[var(--color-gold)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
