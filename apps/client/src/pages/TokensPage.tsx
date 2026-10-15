import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PurchaseTokensResponse, TokenPackage } from '@three-towers/shared';
import { MULTIPLAYER_ENTRY_COST } from '@three-towers/shared';
import { AppBackground } from '../components/layout/AppBackground';
import { apiFetch, ApiError } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

interface PackagesResponse {
  packages: TokenPackage[];
  treasuryAddress: string;
  multiplayerEntryCost: number;
}

export default function TokensPage() {
  const { user, tokens, fetchProfile } = useAuthStore();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [treasury, setTreasury] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<PackagesResponse>('/tokens/packages').then((data) => {
      setPackages(data.packages);
      setTreasury(data.treasuryAddress);
    });
  }, []);

  const purchase = async (packageId: string) => {
    if (!tokens?.accessToken) return;
    setLoadingId(packageId);
    setError(null);
    setMessage(null);
    try {
      const result = await apiFetch<PurchaseTokensResponse>('/tokens/purchase', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        body: JSON.stringify({ packageId }),
      });
      setMessage(result.message);
      await fetchProfile();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Purchase failed');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AppBackground variant="lobby">
      <div className="flex min-h-screen flex-col items-center p-8">
        <div className="lobby-panel w-full max-w-2xl">
          <Link to="/" className="page-back">← Lobby</Link>
          <h1 className="page-title mt-4">Solitaire Tokens</h1>
          <p className="page-subtitle">
            Buy tokens with SOL to enter multiplayer matches. Each game costs{' '}
            {MULTIPLAYER_ENTRY_COST} tokens.
          </p>

          {user && (
            <div className="mt-6 rounded-xl border border-[var(--color-neon)]/30 bg-[var(--color-neon)]/10 p-4">
              <p className="text-sm text-white/60">Your balance</p>
              <p className="text-3xl font-bold text-[var(--color-neon)]">
                {user.tokenBalance} ST
              </p>
            </div>
          )}

          {message && (
            <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {!tokens && (
            <p className="mt-6 text-white/60">
              <Link to="/login" className="text-[var(--color-neon)] hover:underline">
                Sign in
              </Link>{' '}
              to buy and use Solitaire Tokens.
            </p>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <h3 className="font-semibold text-white">{pkg.name}</h3>
                <p className="mt-1 text-2xl font-bold text-[var(--color-neon)]">
                  {pkg.tokens} ST
                </p>
                <p className="mt-1 text-sm text-white/50">{pkg.cryptoAmount} SOL</p>
                <p className="mt-2 text-xs text-white/40">{pkg.description}</p>
                {tokens && (
                  <button
                    type="button"
                    disabled={loadingId === pkg.id}
                    onClick={() => purchase(pkg.id)}
                    className="mt-4 w-full rounded-lg bg-[var(--color-neon)] py-2 text-sm font-semibold text-black disabled:opacity-50"
                  >
                    {loadingId === pkg.id ? 'Processing…' : 'Buy with SOL'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {treasury && (
            <p className="mt-6 text-xs text-white/40">
              Treasury (mainnet): <span className="font-mono">{treasury}</span>
            </p>
          )}

          <p className="mt-4 text-xs text-white/30">
            In development mode, purchases credit instantly without sending SOL. Production
            verifies on-chain SOL transfers to the treasury wallet.
          </p>
        </div>
      </div>
    </AppBackground>
  );
}
