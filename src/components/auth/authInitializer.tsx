'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthInitializer() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await loadUser();
      }
    };
    
    initAuth();
  }, [loadUser]);

  return null;
}