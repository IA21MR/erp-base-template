'use client';

/**
 * Hook con mutaciones del módulo Organizations
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsRepository } from '../../infrastructure/repositories';
import { ORGANIZATIONS_SEARCH_QUERY_KEY } from './useOrganizationsSearch';
import type { Organization } from '../../domain/types';
import type {
  OrganizationFormData,
  RegionalSettingsFormData,
  FiscalSettingsFormData,
  NotificationSettingsFormData,
  BrandingSettingsFormData,
} from '../../application/validations/organization.schema';

export function useOrganizations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [ORGANIZATIONS_SEARCH_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: (data: OrganizationFormData) => organizationsRepository.create(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrganizationFormData }) =>
      organizationsRepository.update(id, data),
    onSuccess: invalidate,
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => organizationsRepository.activate(id),
    onSuccess: invalidate,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => organizationsRepository.deactivate(id),
    onSuccess: invalidate,
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (id: string) => organizationsRepository.setPrimary(id),
    onSuccess: invalidate,
  });

  const updateRegionalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RegionalSettingsFormData }) =>
      organizationsRepository.updateRegionalSettings(id, data),
    onSuccess: invalidate,
  });
  const updateFiscalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FiscalSettingsFormData }) =>
      organizationsRepository.updateFiscalSettings(id, data),
    onSuccess: invalidate,
  });
  const updateNotificationsMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: NotificationSettingsFormData }) =>
      organizationsRepository.updateNotificationSettings(id, data),
    onSuccess: invalidate,
  });
  const updateBrandingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BrandingSettingsFormData }) =>
      organizationsRepository.updateBrandingSettings(id, data),
    onSuccess: invalidate,
  });

  const toggleActive = async (org: Organization) => {
    if (org.active) await deactivateMutation.mutateAsync(org.id);
    else await activateMutation.mutateAsync(org.id);
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    activateMutation.isPending ||
    deactivateMutation.isPending ||
    setPrimaryMutation.isPending ||
    updateRegionalMutation.isPending ||
    updateFiscalMutation.isPending ||
    updateNotificationsMutation.isPending ||
    updateBrandingMutation.isPending;

  return {
    isLoading,
    createOrganization: (d: OrganizationFormData) => createMutation.mutateAsync(d),
    updateOrganization: (id: string, d: OrganizationFormData) =>
      updateMutation.mutateAsync({ id, data: d }),
    toggleActive,
    setPrimary: (id: string) => setPrimaryMutation.mutateAsync(id),
    updateRegional: (id: string, d: RegionalSettingsFormData) =>
      updateRegionalMutation.mutateAsync({ id, data: d }),
    updateFiscal: (id: string, d: FiscalSettingsFormData) =>
      updateFiscalMutation.mutateAsync({ id, data: d }),
    updateNotifications: (id: string, d: NotificationSettingsFormData) =>
      updateNotificationsMutation.mutateAsync({ id, data: d }),
    updateBranding: (id: string, d: BrandingSettingsFormData) =>
      updateBrandingMutation.mutateAsync({ id, data: d }),
  };
}
