/**
 * Hook para obtener todos los permisos del sistema
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { rolesHttpRepository } from '../../infrastructure/repositories/RolesHttpRepository';
import { getModuleFromPermissionCode } from '../../domain/permission-module-rules';
import type { Permission, PermissionsByModule } from '../../domain/types/role.types';

export function useAllPermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsByModule, setPermissionsByModule] = useState<PermissionsByModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await rolesHttpRepository.listPermissions();
      setPermissions(data);

      // Agrupar por módulo
      const grouped = data.reduce((acc, permission) => {
        const module = getModuleFromPermissionCode(permission.code);
        const existing = acc.find((m) => m.module === module);
        if (existing) {
          existing.permissions.push(permission);
        } else {
          acc.push({ module, permissions: [permission] });
        }
        return acc;
      }, [] as PermissionsByModule[]);

      // Ordenar módulos y permisos dentro de cada módulo
      grouped.sort((a, b) => a.module.localeCompare(b.module));
      grouped.forEach((m) => m.permissions.sort((a, b) => a.code.localeCompare(b.code)));

      setPermissionsByModule(grouped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar permisos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    permissionsByModule,
    isLoading,
    error,
    refetch: fetchPermissions,
  };
}
