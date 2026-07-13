export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
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
  email: string;
  username: string;
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
