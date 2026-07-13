import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  UserPublic,
} from '@three-towers/shared';
import { apiFetch } from '../lib/api';

interface AuthState {
  user: UserPublic | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  login: (dto: LoginRequest) => Promise<void>;
  register: (dto: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (dto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(dto),
          });
          set({ user: response.user, tokens: response.tokens, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Login failed',
          });
          throw err;
        }
      },

      register: async (dto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetch<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(dto),
          });
          set({ user: response.user, tokens: response.tokens, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Registration failed',
          });
          throw err;
        }
      },

      logout: async () => {
        const { tokens } = get();
        if (tokens?.refreshToken) {
          try {
            await apiFetch('/auth/logout', {
              method: 'POST',
              body: JSON.stringify({ refreshToken: tokens.refreshToken }),
            });
          } catch {
            // Clear local state even if server logout fails
          }
        }
        set({ user: null, tokens: null, error: null });
      },

      fetchProfile: async () => {
        const { tokens } = get();
        if (!tokens?.accessToken) return;

        try {
          const user = await apiFetch<UserPublic>('/auth/me', {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });
          set({ user });
        } catch {
          set({ user: null, tokens: null });
        }
      },
    }),
    {
      name: 'three-towers-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    },
  ),
);
