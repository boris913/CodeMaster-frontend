'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  authApi,
  type LoginCredentials,
  type RegisterData,
  type UserProfile,
} from '@/lib/api/auth';
import { apiClient } from '@/lib/api-client';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// ─── Types ────────────────────────────────────────────────────────────────────

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number; // timestamp Unix en secondes
  iat: number;
}

interface AuthStore {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;

  // Token management
  setAccessToken: (token: string) => void;
  clearTokens: () => void;
  refreshAccessToken: () => Promise<void>;
  setupTokenRefresh: (accessToken: string) => void;
  cancelTokenRefresh: () => void;

  // UI
  clearError: () => void;
  setUser: (user: UserProfile) => void;
}

// ─── Timer global (hors du store pour éviter la sérialisation) ────────────────
// On le garde hors du store Zustand car setTimeout n'est pas sérialisable
let refreshTimerId: ReturnType<typeof setTimeout> | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
};

/**
 * Calcule le délai en ms avant de déclencher un refresh.
 * Le refresh est planifié 5 minutes avant l'expiration du token.
 * Retourne null si le token est déjà expiré ou invalide.
 */
function computeRefreshDelay(accessToken: string): number | null {
  try {
    const decoded = jwtDecode<JwtPayload>(accessToken);
    const nowMs = Date.now();
    const expMs = decoded.exp * 1000;
    const fiveMinMs = 5 * 60 * 1000;

    // Délai = (expiration - maintenant) - 5 minutes
    const delayMs = expMs - nowMs - fiveMinMs;

    // Si le token expire dans moins de 5 minutes → refresh immédiat (délai 0)
    // Si le token est déjà expiré → retourner null pour ne pas planifier
    if (expMs <= nowMs) {
      return null; // Token déjà expiré, pas de planification
    }

    return Math.max(delayMs, 0); // Minimum 0ms (refresh immédiat)
  } catch {
    return null;
  }
}

// ─── Callbacks injectés dans ApiClient ────────────────────────────────────────
// Enregistrement différé pour éviter les imports circulaires
let storeRef: {
  setAccessToken: (token: string) => void;
  clearTokens: () => void;
} | null = null;

apiClient.registerCallbacks({
  onRefreshSuccess: (accessToken: string) => {
    storeRef?.setAccessToken(accessToken);
  },
  onRefreshFailure: () => {
    storeRef?.clearTokens();
  },
});

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      // ── Actions définies une seule fois ──────────────────────────────────────

      const cancelTokenRefresh = () => {
        if (refreshTimerId !== null) {
          clearTimeout(refreshTimerId);
          refreshTimerId = null;
        }
      };

      const setupTokenRefresh = (accessToken: string) => {
        // Annuler tout timer existant avant d'en créer un nouveau
        cancelTokenRefresh();

        const delayMs = computeRefreshDelay(accessToken);

        if (delayMs === null) {
          // Token déjà expiré au moment du setup → ne rien planifier
          // L'interceptor 401 prendra le relai sur la prochaine requête
          console.warn('[Auth] Token expiré au moment du setup du refresh proactif');
          return;
        }

        const delayMinutes = Math.round(delayMs / 1000 / 60);
        console.debug(`[Auth] Refresh proactif planifié dans ~${delayMinutes} min`);

        refreshTimerId = setTimeout(async () => {
          refreshTimerId = null;
          await get().refreshAccessToken();
        }, delayMs);
      };

      const setAccessToken = (token: string) => {
        apiClient.setAccessToken(token);
        set({ accessToken: token, isAuthenticated: true });

        // Replanifier le refresh à chaque nouveau token
        setupTokenRefresh(token);
      };

      const clearTokens = () => {
        cancelTokenRefresh();
        apiClient.clearAccessToken();

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });

        Cookies.remove('userRole', COOKIE_OPTIONS);
      };

      // Exposer les actions pour l'interceptor ApiClient
      storeRef = { setAccessToken, clearTokens };

      // ── Store object ──────────────────────────────────────────────────────────

      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // ── Login ───────────────────────────────────────────────────────────────
        login: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authApi.login(credentials);
            const decoded = jwtDecode<JwtPayload>(response.accessToken);

            // Stocker le token en mémoire dans ApiClient
            apiClient.setAccessToken(response.accessToken);

            set({
              accessToken: response.accessToken,
              isAuthenticated: true,
              isLoading: false,
            });

            // Cookie pour le middleware Next.js (routing protégé)
            Cookies.set('userRole', decoded.role, {
              expires: 7,
              ...COOKIE_OPTIONS,
            });

            // ✅ Planifier le refresh proactif
            setupTokenRefresh(response.accessToken);

            // Charger le profil en arrière-plan
            get().loadUser().catch(console.error);
          } catch (error: unknown) {
            const message =
              (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Échec de la connexion';
            set({ error: message, isLoading: false });
            throw error;
          }
        },

        // ── Register ────────────────────────────────────────────────────────────
        register: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authApi.register(data);
            const decoded = jwtDecode<JwtPayload>(response.accessToken);

            apiClient.setAccessToken(response.accessToken);

            set({
              accessToken: response.accessToken,
              isAuthenticated: true,
              isLoading: false,
            });

            Cookies.set('userRole', decoded.role, {
              expires: 7,
              ...COOKIE_OPTIONS,
            });

            // ✅ Planifier le refresh proactif
            setupTokenRefresh(response.accessToken);

            get().loadUser().catch(console.error);
          } catch (error: unknown) {
            const message =
              (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? "Échec de l'inscription";
            set({ error: message, isLoading: false });
            throw error;
          }
        },

        // ── Logout ──────────────────────────────────────────────────────────────
        logout: async () => {
          // ✅ Annuler le refresh planifié immédiatement
          cancelTokenRefresh();

          try {
            await authApi.logout(); // Cookie httpOnly envoyé automatiquement
          } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
          } finally {
            clearTokens();
          }
        },

        // ── Refresh proactif ────────────────────────────────────────────────────
        refreshAccessToken: async () => {
          try {
            console.debug('[Auth] Refresh proactif en cours...');
            const response = await authApi.refreshToken();

            // setAccessToken gère : ApiClient + store + replanification
            setAccessToken(response.accessToken);

            console.debug('[Auth] Refresh proactif réussi ✅');
          } catch (error) {
            console.error('[Auth] Refresh proactif échoué, déconnexion:', error);
            clearTokens();

            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        },

        // ── Load user ───────────────────────────────────────────────────────────
        loadUser: async () => {
          try {
            const user = await authApi.me();
            set({ user, isAuthenticated: true });

            // Mettre à jour le cookie userRole si le rôle a changé
            Cookies.set('userRole', user.role, {
              expires: 7,
              ...COOKIE_OPTIONS,
            });
          } catch {
            console.error('[Auth] Impossible de charger le profil utilisateur');
            clearTokens();
          }
        },

        // ── Actions exposées ────────────────────────────────────────────────────
        setAccessToken,
        clearTokens,
        setupTokenRefresh,
        cancelTokenRefresh,

        clearError: () => set({ error: null }),
        setUser: (user) => set({ user }),
      };
    },

    // ── Persistence ─────────────────────────────────────────────────────────────
    {
      name: 'auth-storage',

      // On ne persiste pas le refreshToken (httpOnly cookie) ni les fonctions
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      // ✅ À la réhydratation (rechargement de page) :
      // - Resynchroniser l'accessToken dans ApiClient (mémoire)
      // - Replanifier le refresh proactif si le token est encore valide
      // - Si expiré, tenter un refresh immédiat via cookie httpOnly
      onRehydrateStorage: () => async (state) => {
        if (!state?.accessToken) return;

        const delayMs = computeRefreshDelay(state.accessToken);

        if (delayMs === null) {
          // ✅ Token expiré au rechargement → refresh immédiat
          console.debug('[Auth] Token expiré au rechargement, refresh immédiat...');
          try {
            const response = await authApi.refreshToken();
            state.setAccessToken(response.accessToken);
            console.debug('[Auth] Refresh au rechargement réussi ✅');
          } catch {
            // Le cookie de refresh est peut-être aussi expiré
            console.warn('[Auth] Refresh au rechargement échoué, déconnexion');
            state.clearTokens();
          }
        } else {
          // ✅ Token encore valide → synchroniser + planifier le prochain refresh
          apiClient.setAccessToken(state.accessToken);
          state.setupTokenRefresh(state.accessToken);
          console.debug('[Auth] Session restaurée depuis le stockage ✅');
        }
      },
    }
  )
);