/**
 * Hook personalizado para el manejo de autenticación
 * Proporciona acceso al usuario autenticado y funciones de auth
 */
'use client';

import { useState, useEffect } from 'react';
import { User } from '../../domain/entities/User.entity';
import { useAuthToken } from './useAuthToken';
import { authRepository } from '../../infrastructure/di/AuthContainer';

export interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

/**
 * Hook para manejar el estado de autenticación
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken, refreshToken, clearTokens } = useAuthToken();

  /**
   * Obtiene el perfil del usuario autenticado
   */
  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      if (!accessToken) {
        setUser(null);
        return;
      }

      const profile = await authRepository.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const logout = async () => {
    try {
      if (refreshToken) {
        await authRepository.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  // Cargar usuario cuando cambia el token de acceso
  useEffect(() => {
    refreshAuth();
  }, [accessToken]);

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    accessToken: authRepository.getAccessToken(),
    logout,
    refreshAuth,
  };
}
