'use client';

/**
 * Hook para listar roles (solo lectura)
 */

import { useQuery } from '@tanstack/react-query';
import { rolesHttpRepository } from '../../infrastructure/repositories/RolesHttpRepository';
import type { Role } from '../../domain/types';

export const ROLES_QUERY_KEY = 'roles';

interface UseRolesOptions {
  enabled?: boolean;
}

export function useRoles({ enabled = true }: UseRolesOptions = {}) {
  const { data: roles = [], isLoading, error, refetch } = useQuery({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: () => rolesHttpRepository.listRoles(),
    enabled,
    staleTime: 1000 * 60 * 2,
  });

  return {
    roles,
    isLoading,
    error: error?.message ?? null,
    fetchRoles: refetch,
  };
}
