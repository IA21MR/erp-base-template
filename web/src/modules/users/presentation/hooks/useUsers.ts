'use client';

/**
 * Hook para mutaciones de usuarios (crear, actualizar, activar/desactivar)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersRepository } from '../../infrastructure/repositories';
import { USERS_SEARCH_QUERY_KEY } from './useUsersSearch';
import type { User } from '../../domain/types';
import type { UserFormData } from '../../application/validations/user.schema';

export function useUsers() {
  const queryClient = useQueryClient();

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: [USERS_SEARCH_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return usersRepository.create(data);
    },
    onSuccess: () => invalidateUsers(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UserFormData }) => {
      // Primero actualizar roles si se proporcionaron
      if (data.roleIds && data.roleIds.length > 0) {
        try {
          await usersRepository.assignRoles(id, data.roleIds);
        } catch (roleError) {
          console.warn('Error al asignar roles, continuando con actualización:', roleError);
        }
      }
      // Luego actualizar los datos del usuario
      return usersRepository.update(id, data);
    },
    onSuccess: () => invalidateUsers(),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => usersRepository.activate(id),
    onSuccess: () => invalidateUsers(),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => usersRepository.deactivate(id),
    onSuccess: () => invalidateUsers(),
  });

  const createUser = async (data: UserFormData) => {
    await createMutation.mutateAsync(data);
  };

  const updateUser = async (id: number, data: UserFormData) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const toggleUserActive = async (user: User) => {
    if (user.active) {
      await deactivateMutation.mutateAsync(user.id);
    } else {
      await activateMutation.mutateAsync(user.id);
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    activateMutation.isPending ||
    deactivateMutation.isPending;

  return {
    isLoading,
    createUser,
    updateUser,
    toggleUserActive,
  };
}
