/**
 * Hook personalizado para sincronizar tokens entre localStorage y cookies
 * Las cookies son necesarias para que el proxy SSR de Next.js pueda leer los tokens
 */
'use client';

import { useEffect } from 'react';
import { useAuthToken } from '@/modules/auth/presentation/hooks/useAuthToken';
import { decodeJWT } from '@/modules/auth/application/utils/JwtUtils';

/**
 * Sincroniza tokens entre localStorage y cookies
 */
export function useTokenSync() {
  const { accessToken, refreshToken } = useAuthToken();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';

    if (accessToken) {
      const payload = decodeJWT(accessToken);
      const maxAge = payload?.exp
        ? Math.max(60, payload.exp - Math.floor(Date.now() / 1000))
        : 60 * 60;
      document.cookie = `access_token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
    } else {
      document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
    }

    if (refreshToken) {
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
    } else {
      document.cookie = 'refresh_token=; path=/; max-age=0; SameSite=Lax';
    }
  }, [accessToken, refreshToken]);
}
