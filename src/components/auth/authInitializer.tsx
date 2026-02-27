'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export function AuthInitializer() {
  const { loadUser, isAuthenticated, setTokens, setUser } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = Cookies.get('accessToken') || localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken && !isAuthenticated) {
        // Restaurer les tokens dans le store
        if (refreshToken) {
          setTokens(accessToken, refreshToken);
        }

        // Essayer de charger l'utilisateur
        try {
          await loadUser();
        } catch (error) {
          // Si le chargement échoue, nettoyer
          Cookies.remove('accessToken', { path: '/' });
          Cookies.remove('userRole', { path: '/' });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } else if (accessToken && isAuthenticated) {
        // Déjà authentifié, mais on peut mettre à jour le cookie userRole si absent
        const userRole = Cookies.get('userRole');
        if (!userRole) {
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
        }
      }
    };

    initAuth();
  }, [loadUser, isAuthenticated, setTokens, setUser]);

  return null;
}