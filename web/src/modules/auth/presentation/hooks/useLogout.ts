/**
 * Hook para manejar el logout del usuario
 * 
 * Proporciona funcionalidad para cerrar sesión de forma segura,
 * invalidando tokens tanto en servidor como en cliente
 */
'use client';

import { useState } from 'react';
import { useAuthToken } from './useAuthToken';
import { logoutUseCase } from '../../infrastructure/di/AuthContainer';

export interface UseLogoutResult {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

/**
 * Hook para cerrar sesión
 */
export function useLogout(): UseLogoutResult {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { refreshToken, clearTokens } = useAuthToken();

  const logout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Ejecutar caso de uso de logout
      await logoutUseCase.execute(refreshToken);
      
      // Limpiar estado local
      clearTokens();
      
      // Redirigir a login con hard reload para limpiar estado
      window.location.href = '/login';
    } catch (error) {
      console.error('Error durante logout:', error);
      
      // Aunque falle, limpiar y redirigir
      clearTokens();
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    logout,
    isLoggingOut,
  };
}
