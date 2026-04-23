/**
 * Hook para gestión de roles (CRUD)
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesHttpRepository } from '../../infrastructure/repositories/RolesHttpRepository';
import { ROLES_QUERY_KEY } from './useRoles';
import type { Role } from '../../domain/types/role.types';
import type { RoleFormData } from '../../application/validations/role.schema';

export function useRolesManagement() {
  const queryClient = useQueryClient();

  const invalidateRoles = () =>
    queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });

  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: () => rolesHttpRepository.listRoles(),
    staleTime: 1000 * 60 * 2,
  });

  const createMutation = useMutation({
    mutationFn: (data: RoleFormData) => rolesHttpRepository.createRole(data),
    onSuccess: () => invalidateRoles(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleFormData }) =>
      rolesHttpRepository.updateRole(id, data),
    onSuccess: () => invalidateRoles(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesHttpRepository.deleteRole(id),
    onSuccess: () => invalidateRoles(),
  });

  const createRole = async (data: RoleFormData) => {
    await createMutation.mutateAsync(data);
  };

  const updateRole = async (id: number, data: RoleFormData) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const deleteRole = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  return {
    roles,
    isLoading,
    error: error?.message ?? null,
    createRole,
    updateRole,
    deleteRole,
    refetch: invalidateRoles,
  };
}
