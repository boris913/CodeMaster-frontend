'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type LoginCredentials, type RegisterData, type UserProfile } from '@/lib/api/auth';

interface AuthStore {
  // État
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Connexion
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          
          // Stocker les tokens
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Stocker dans localStorage pour l'intercepteur axios
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
          }

          // Charger le profil utilisateur
          await get().loadUser();
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Échec de la connexion',
            isLoading: false,
          });
          throw error;
        }
      },

      // Inscription
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Stocker dans localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
          }

          await get().loadUser();
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Échec de l\'inscription',
            isLoading: false,
          });
          throw error;
        }
      },

      // Déconnexion
      logout: async () => {
        const { refreshToken } = get();
        
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
          }
        }

        // Nettoyer l'état
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        // Nettoyer le localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },

      // Effacer les erreurs
      clearError: () => set({ error: null }),

      // Définir les tokens
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
      },

      // Effacer les tokens
      clearTokens: () => {
        set({ accessToken: null, refreshToken: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },

      // Charger le profil utilisateur
      loadUser: async () => {
        try {
          const user = await authApi.me();
          set({ user });
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
          set({ user: null, isAuthenticated: false });
          get().clearTokens();
        }
      },

      // Définir l'utilisateur
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);