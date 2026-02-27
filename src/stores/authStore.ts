'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type LoginCredentials, type RegisterData, type UserProfile } from '@/lib/api/auth';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface AuthStore {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

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
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);

          // Décoder le token pour obtenir le rôle immédiatement
          const decoded: any = jwtDecode(response.accessToken);
          const userRole = decoded.role; // selon le payload de votre JWT

          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // localStorage pour l'intercepteur axios
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);

          // Cookies pour le middleware
          Cookies.set('accessToken', response.accessToken, {
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });
          Cookies.set('userRole', userRole, {
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });

          // Charger le profil complet en arrière-plan (ne bloque pas la redirection)
          get().loadUser().catch(console.error);
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Échec de la connexion',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);

          const decoded: any = jwtDecode(response.accessToken);
          const userRole = decoded.role;

          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);

          Cookies.set('accessToken', response.accessToken, {
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });
          Cookies.set('userRole', userRole, {
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });

          get().loadUser().catch(console.error);
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Échec de l\'inscription',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        const { refreshToken } = get();

        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
          }
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('userRole', { path: '/' });
      },

      clearError: () => set({ error: null }),

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        Cookies.set('accessToken', accessToken, {
          expires: 7,
          path: '/',
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        });

        // Optionnel : décoder et définir le rôle si disponible
        try {
          const decoded: any = jwtDecode(accessToken);
          if (decoded.role) {
            Cookies.set('userRole', decoded.role, {
              expires: 7,
              path: '/',
              sameSite: 'strict',
              secure: process.env.NODE_ENV === 'production',
            });
          }
        } catch {
          // ignorer
        }
      },

      clearTokens: () => {
        set({ accessToken: null, refreshToken: null });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('userRole', { path: '/' });
      },

      loadUser: async () => {
        try {
          const user = await authApi.me();
          set({ user, isAuthenticated: true });

          // Mettre à jour le cookie userRole (au cas où le rôle aurait changé)
          Cookies.set('userRole', user.role, {
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });
        } catch (error) {
          console.error('Session expirée ou invalide');
          set({ user: null, isAuthenticated: false });
          Cookies.remove('accessToken', { path: '/' });
          Cookies.remove('userRole', { path: '/' });
        }
      },

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