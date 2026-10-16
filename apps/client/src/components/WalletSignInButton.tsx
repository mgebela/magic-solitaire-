import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WalletNonceResponse } from '@three-towers/shared';
import { apiFetch } from '../lib/api';
import {
  connectSolanaWallet,
  getWalletInstallUrl,
  listSolanaWallets,
  signSolanaMessage,
  type SolanaWalletId,
  type SolanaWalletOption,
} from '../lib/solana-wallet';
import { useAuthStore } from '../stores/authStore';

interface WalletSignInButtonProps {
  onSuccess?: () => void;
  className?: string;
}

function WalletMark({ id }: { id: SolanaWalletId }) {
  if (id === 'phantom') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      </svg>
    );
  }
  if (id === 'solflare') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3.2" fill="currentColor" />
        <path
          d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.1 6.1l1.6 1.6M16.3 16.3l1.6 1.6M17.9 6.1l-1.6 1.6M7.7 16.3l-1.6 1.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 9.5V8.2A5 5 0 0 1 12 3.2 5 5 0 0 1 17 8.2v1.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect x="5" y="9.2" width="14" height="11.3" rx="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 13.2h14" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function WalletSignInButton({ onSuccess, className }: WalletSignInButtonProps) {
  const navigate = useNavigate();
  const { walletLogin, isLoading, clearError } = useAuthStore();
  const [wallets, setWallets] = useState<SolanaWalletOption[]>(() => listSolanaWallets());
  const [activeId, setActiveId] = useState<SolanaWalletId | null>(null);

  useEffect(() => {
    const refresh = () => setWallets(listSolanaWallets());
    refresh();
    window.addEventListener('focus', refresh);
    const retry = window.setTimeout(refresh, 400);
    return () => {
      window.removeEventListener('focus', refresh);
      window.clearTimeout(retry);
    };
  }, []);

  const loading = isLoading || activeId !== null;

  const handleWalletSignIn = async (wallet: SolanaWalletOption) => {
    clearError();
    if (!wallet.installed) {
      window.open(getWalletInstallUrl(wallet.id), '_blank', 'noopener,noreferrer');
      useAuthStore.setState({
        error: `Install ${wallet.name}, then return here and choose it again.`,
      });
      return;
    }

    setActiveId(wallet.id);
    try {
      const address = await connectSolanaWallet(wallet.id);
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
        error: err instanceof Error ? err.message : `${wallet.name} sign-in failed`,
      });
    } finally {
      setActiveId(null);
    }
  };

  return (
    <div className={`wallet-options ${className ?? ''}`.trim()}>
      <p className="wallet-options__label">Sign in with a wallet</p>
      <div className="wallet-options__list">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            type="button"
            className={`wallet-option wallet-option--${wallet.id}`}
            onClick={() => handleWalletSignIn(wallet)}
            disabled={loading}
          >
            <span className="wallet-option__icon">
              <WalletMark id={wallet.id} />
            </span>
            <span className="wallet-option__copy">
              <span className="wallet-option__name">{wallet.name}</span>
              <span className="wallet-option__status">
                {activeId === wallet.id ? 'Connecting' : wallet.installed ? 'Ready' : 'Install'}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
