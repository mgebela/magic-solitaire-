import bs58 from 'bs58';

export interface SolanaWalletProvider {
  isPhantom?: boolean;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  signMessage(
    message: Uint8Array,
    display?: 'utf8' | 'hex',
  ): Promise<{ signature: Uint8Array }>;
}

declare global {
  interface Window {
    solana?: SolanaWalletProvider;
  }
}

export function getSolanaProvider(): SolanaWalletProvider | null {
  if (typeof window === 'undefined') return null;
  return window.solana?.isPhantom ? window.solana : null;
}

export async function connectSolanaWallet(): Promise<string> {
  const provider = getSolanaProvider();
  if (!provider) {
    throw new Error('Phantom wallet not found. Install Phantom to sign in with Solana.');
  }

  const { publicKey } = await provider.connect();
  return publicKey.toString();
}

export async function signSolanaMessage(message: string): Promise<string> {
  const provider = getSolanaProvider();
  if (!provider) {
    throw new Error('Phantom wallet not found');
  }

  const encoded = new TextEncoder().encode(message);
  const { signature } = await provider.signMessage(encoded, 'utf8');
  return bs58.encode(signature);
}
