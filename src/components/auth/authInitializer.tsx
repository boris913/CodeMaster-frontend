'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Composant monté une seule fois dans le layout racine.
 * Son seul rôle : charger le profil utilisateur si la session
 * est restaurée mais que le profil n'est pas encore disponible.
 */
export function AuthInitializer() {
  const { isAuthenticated, user, loadUser } = useAuthStore();

  useEffect(() => {
    // Si on est authentifié (token restauré) mais sans profil → charger le profil
    if (isAuthenticated && !user) {
      loadUser().catch(console.error);
    }
  }, [isAuthenticated, user, loadUser]);

  return null;
}
