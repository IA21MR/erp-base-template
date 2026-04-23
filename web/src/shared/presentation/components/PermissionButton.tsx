/**
 * Botón que se muestra/oculta según los permisos del usuario
 */
'use client';

import { usePermissions } from '@/modules/auth/presentation/hooks/usePermissions';
import { Button } from './ui/Button';
import type { ButtonProps } from './ui/Button';

interface PermissionButtonProps extends ButtonProps {
  /**
   * Permiso requerido para mostrar el botón
   */
  requiredPermission?: string;
  
  /**
   * Lista de permisos - el usuario debe tener AL MENOS UNO
   */
  requiredPermissions?: string[];
  
  /**
   * Si es true, el usuario debe tener TODOS los permisos especificados
   */
  requireAllPermissions?: boolean;
  
  /**
   * Si es true, muestra el botón deshabilitado en lugar de ocultarlo
   */
  showDisabled?: boolean;
}

/**
 * Botón que verifica permisos antes de mostrarse
 */
export function PermissionButton({
  requiredPermission,
  requiredPermissions = [],
  requireAllPermissions = false,
  showDisabled = false,
  children,
  disabled,
  ...props
}: PermissionButtonProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  // Si no hay permisos requeridos, mostrar el botón normalmente
  if (!requiredPermission && requiredPermissions.length === 0) {
    return <Button disabled={disabled} {...props}>{children}</Button>;
  }

  // Verificar permiso único
  if (requiredPermission) {
    const hasRequiredPermission = hasPermission(requiredPermission);
    
    if (!hasRequiredPermission) {
      if (showDisabled) {
        return <Button disabled {...props}>{children}</Button>;
      }
      return null;
    }
  }

  // Verificar múltiples permisos
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasRequiredPermissions) {
      if (showDisabled) {
        return <Button disabled {...props}>{children}</Button>;
      }
      return null;
    }
  }

  return <Button disabled={disabled} {...props}>{children}</Button>;
}
