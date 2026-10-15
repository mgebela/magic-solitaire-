export type AuthMethod = 'email' | 'wallet';
export type WalletChain = 'ethereum' | 'solana';

export interface User {
  id: string;
  email: string | null;
  username: string;
  passwordHash: string | null;
  walletAddress?: string;
  walletChain?: WalletChain;
  authMethod: AuthMethod;
  tokenBalance: number;
  country?: string;
  language?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/** User data safe to send to the client (no password hash). */
export interface UserPublic {
  id: string;
  email: string | null;
  username: string;
  walletAddress?: string;
  walletChain?: WalletChain;
  authMethod: AuthMethod;
  tokenBalance: number;
  country?: string;
  language?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  country?: string;
  language?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface WalletNonceRequest {
  address: string;
  chain?: WalletChain;
}

export interface WalletNonceResponse {
  nonce: string;
  message: string;
  /** Solana cluster for wallet network hint. */
  network: 'mainnet-beta' | 'devnet';
}

export interface WalletVerifyRequest {
  message: string;
  signature: string;
  chain?: WalletChain;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserPublic;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export type OAuthProvider = 'google' | 'discord';

export interface OAuthStubResponse {
  provider: OAuthProvider;
  configured: boolean;
  message: string;
  authorizationUrl?: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  /** Display price in USD (reference only). */
  priceUsd: number;
  /** ETH amount as string (e.g. "0.001"). */
  cryptoAmount: string;
  chain: WalletChain;
  description: string;
}

export interface TokenBalanceResponse {
  balance: number;
  multiplayerEntryCost: number;
}

export interface PurchaseTokensRequest {
  packageId: string;
  /** On-chain transaction hash after sending crypto to treasury. */
  cryptoTxHash?: string;
}

export interface PurchaseTokensResponse {
  transactionId: string;
  status: 'pending' | 'completed';
  tokensGranted?: number;
  balance?: number;
  treasuryAddress?: string;
  cryptoAmount?: string;
  message: string;
}

export interface TokenTransactionPublic {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  status: string;
  packageId?: string;
  createdAt: string;
}

/** Cost in Solitaire Tokens to enter a ranked/casual multiplayer match. */
export const MULTIPLAYER_ENTRY_COST = 10;

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'pack_starter',
    name: 'Starter Pack',
    tokens: 50,
    priceUsd: 4.99,
    cryptoAmount: '0.05',
    chain: 'solana',
    description: '50 Solitaire Tokens — ~5 multiplayer games',
  },
  {
    id: 'pack_standard',
    name: 'Standard Pack',
    tokens: 150,
    priceUsd: 12.99,
    cryptoAmount: '0.12',
    chain: 'solana',
    description: '150 Solitaire Tokens — ~15 multiplayer games',
  },
  {
    id: 'pack_pro',
    name: 'Pro Pack',
    tokens: 500,
    priceUsd: 39.99,
    cryptoAmount: '0.35',
    chain: 'solana',
    description: '500 Solitaire Tokens — ~50 multiplayer games',
  },
];
