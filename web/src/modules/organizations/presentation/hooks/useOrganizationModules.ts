'use client';

/**
 * Hook para gestionar los módulos habilitados de una organización.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsRepository } from '../../infrastructure/repositories';

export const AVAILABLE_MODULES_KEY = 'organizations-available-modules';
export const ENABLED_MODULES_KEY = 'organization-enabled-modules';

export function useOrganizationModules(organizationId: string | null) {
  const queryClient = useQueryClient();

  const availableQuery = useQuery({
    queryKey: [AVAILABLE_MODULES_KEY],
    queryFn: () => organizationsRepository.getAvailableModules(),
    staleTime: 5 * 60 * 1000,
  });

  const enabledQuery = useQuery({
    queryKey: [ENABLED_MODULES_KEY, organizationId],
    queryFn: () => organizationsRepository.getEnabledModules(organizationId!),
    enabled: !!organizationId,
  });

  const enableMutation = useMutation({
    mutationFn: (moduleName: string) =>
      organizationsRepository.enableModule(organizationId!, moduleName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENABLED_MODULES_KEY, organizationId] });
    },
  });

  const disableMutation = useMutation({
    mutationFn: (moduleName: string) =>
      organizationsRepository.disableModule(organizationId!, moduleName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENABLED_MODULES_KEY, organizationId] });
    },
  });

  const toggle = async (moduleName: string, currentlyEnabled: boolean) => {
    if (currentlyEnabled) {
      await disableMutation.mutateAsync(moduleName);
    } else {
      await enableMutation.mutateAsync(moduleName);
    }
  };

  return {
    availableModules: availableQuery.data ?? [],
    enabledModules: enabledQuery.data ?? [],
    isLoading: availableQuery.isLoading || enabledQuery.isLoading,
    isToggling: enableMutation.isPending || disableMutation.isPending,
    toggle,
  };
}
