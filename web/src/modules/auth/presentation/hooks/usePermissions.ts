/**
 * Hook para verificar permisos del usuario
 * Decodifica el token JWT y verifica si el usuario tiene los permisos necesarios
 */
'use client';

import { useCallback, useMemo } from 'react';
import { useAuthToken } from './useAuthToken';
import { decodeJWT } from '../../application/utils/JwtUtils';

export interface UsePermissionsResult {
  /**
   * Array de permisos del usuario actual
   */
  permissions: string[];
  
  /**
   * Verifica si el usuario tiene un permiso específico
   */
  hasPermission: (permission: string) => boolean;
  
  /**
   * Verifica si el usuario tiene TODOS los permisos especificados
   */
  hasAllPermissions: (permissions: string[]) => boolean;
  
  /**
   * Verifica si el usuario tiene AL MENOS UNO de los permisos especificados
   */
  hasAnyPermission: (permissions: string[]) => boolean;
  
  /**
   * Información del usuario desde el token
   */
  user: {
    id: number;
    email: string;
  } | null;
}

/**
 * Hook para manejar permisos del usuario
 */
export function usePermissions(): UsePermissionsResult {
  const { accessToken } = useAuthToken();

  // Decodificar el token y extraer información
  const decoded = useMemo(() => {
    if (!accessToken) return null;
    return decodeJWT(accessToken);
  }, [accessToken]);

  const permissions = useMemo(() => {
    return decoded?.permissions || [];
  }, [decoded]);

  const user = useMemo(() => {
    if (!decoded) return null;
    return {
      id: decoded.sub,
      email: decoded.email,
    };
  }, [decoded]);

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  /**
   * Verifica si el usuario tiene TODOS los permisos especificados
   */
  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.every((permission) =>
        permissions.includes(permission)
      );
    },
    [permissions]
  );

  /**
   * Verifica si el usuario tiene AL MENOS UNO de los permisos especificados
   */
  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.some((permission) =>
        permissions.includes(permission)
      );
    },
    [permissions]
  );

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    user,
  };
}
