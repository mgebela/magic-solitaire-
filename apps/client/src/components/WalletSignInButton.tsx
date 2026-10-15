import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSolanaWallet, signSolanaMessage } from '../lib/solana-wallet';
import { apiFetch } from '../lib/api';
import type { WalletNonceResponse } from '@three-towers/shared';
import { useAuthStore } from '../stores/authStore';

interface WalletSignInButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export function WalletSignInButton({ onSuccess, className }: WalletSignInButtonProps) {
  const navigate = useNavigate();
  const { walletLogin, isLoading, error, clearError } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(false);

  const loading = isLoading || localLoading;

  const handleWalletSignIn = async () => {
    clearError();
    setLocalLoading(true);
    try {
      const address = await connectSolanaWallet();
      const nonceResponse = await apiFetch<WalletNonceResponse>(
        `/auth/wallet/nonce?address=${encodeURIComponent(address)}`,
      );
      const signature = await signSolanaMessage(nonceResponse.message);
      await walletLogin({
        message: nonceResponse.message,
        signature,
        chain: 'solana',
      });
      onSuccess?.() ?? navigate('/');
    } catch (err) {
      useAuthStore.setState({
        error: err instanceof Error ? err.message : 'Wallet sign-in failed',
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleWalletSignIn}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-400/40 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20 disabled:opacity-50"
      >
        <span className="text-lg">◎</span>
        {loading ? 'Connecting Phantom…' : 'Sign in with Solana Wallet'}
      </button>
      {error && <p className="mt-2 text-center text-sm text-red-300">{error}</p>}
    </div>
  );
}
