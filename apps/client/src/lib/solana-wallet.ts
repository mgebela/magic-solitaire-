import bs58 from 'bs58';

export type SolanaWalletId = 'phantom' | 'solflare' | 'backpack';

export interface SolanaWalletProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  isConnected?: boolean;
  publicKey?: { toString(): string };
  connect(): Promise<{ publicKey: { toString(): string } } | void>;
  signMessage(
    message: Uint8Array,
    display?: 'utf8' | 'hex',
  ): Promise<Uint8Array | { signature: Uint8Array | string }>;
}

export interface SolanaWalletOption {
  id: SolanaWalletId;
  name: string;
  installUrl: string;
  installed: boolean;
}

declare global {
  interface Window {
    solana?: SolanaWalletProvider;
    phantom?: { solana?: SolanaWalletProvider };
    solflare?: SolanaWalletProvider;
    backpack?: SolanaWalletProvider;
  }
}

const WALLET_META: Array<Omit<SolanaWalletOption, 'installed'>> = [
  { id: 'phantom', name: 'Phantom', installUrl: 'https://phantom.app/download' },
  { id: 'solflare', name: 'Solflare', installUrl: 'https://solflare.com/download' },
  { id: 'backpack', name: 'Backpack', installUrl: 'https://backpack.app/download' },
];

let activeProvider: SolanaWalletProvider | null = null;
let activeWalletId: SolanaWalletId | null = null;

function getInjectedProvider(id: SolanaWalletId): SolanaWalletProvider | null {
  if (typeof window === 'undefined') return null;

  switch (id) {
    case 'phantom':
      return window.phantom?.solana ?? (window.solana?.isPhantom ? window.solana : null) ?? null;
    case 'solflare':
      return window.solflare ?? (window.solana?.isSolflare ? window.solana : null) ?? null;
    case 'backpack':
      return window.backpack ?? (window.solana?.isBackpack ? window.solana : null) ?? null;
  }
}

export function listSolanaWallets(): SolanaWalletOption[] {
  return WALLET_META.map((wallet) => ({
    ...wallet,
    installed: Boolean(getInjectedProvider(wallet.id)),
  }));
}

function normalizeSignature(result: Uint8Array | { signature: Uint8Array | string }): Uint8Array {
  if (result instanceof Uint8Array) return result;
  if (typeof result.signature === 'string') return bs58.decode(result.signature);
  return result.signature;
}

export async function connectSolanaWallet(id: SolanaWalletId): Promise<string> {
  const wallet = WALLET_META.find((item) => item.id === id);
  const provider = getInjectedProvider(id);
  if (!wallet || !provider) {
    throw new Error(
      `${wallet?.name ?? 'Wallet'} is not installed. Install it, then return here to sign in.`,
    );
  }

  const connected = await provider.connect();
  const publicKey = connected && 'publicKey' in connected && connected.publicKey
    ? connected.publicKey
    : provider.publicKey;
  if (!publicKey) {
    throw new Error(`${wallet.name} did not return a public key.`);
  }

  activeProvider = provider;
  activeWalletId = id;
  return publicKey.toString();
}

export async function signSolanaMessage(message: string): Promise<string> {
  const provider = activeProvider ?? (activeWalletId ? getInjectedProvider(activeWalletId) : null);
  if (!provider) {
    throw new Error('Connect a Solana wallet before signing in.');
  }

  const encoded = new TextEncoder().encode(message);
  const result = await provider.signMessage(encoded, 'utf8');
  return bs58.encode(normalizeSignature(result));
}

export function getWalletInstallUrl(id: SolanaWalletId): string {
  return WALLET_META.find((wallet) => wallet.id === id)?.installUrl ?? 'https://solana.com/ecosystem/explore?categories=wallet';
}
