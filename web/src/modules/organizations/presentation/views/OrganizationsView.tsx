'use client';

/**
 * Vista principal del módulo Organizations.
 */
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { extractErrorMessage } from '@/shared/utils';

import { OperationalFilters } from '@/shared/presentation/components/ui/OperationalFilters';
import { Input } from '@/shared/presentation/components/ui/Input';
import {
  PaginationControls,
  Button,
} from '@/shared/presentation/components/ui';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { ToastNotifications } from '@/shared/presentation/components/ui/ToastNotifications';
import { usePermissions } from '@/modules/auth/presentation/hooks/usePermissions';

import { OrganizationsTable } from '../components/OrganizationsTable';
import { OrganizationFormModal } from '../components/OrganizationFormModal';
import { OrganizationSettingsModal } from '../components/OrganizationSettingsModal';
import { useOrganizations } from '../hooks/useOrganizations';
import { useOrganizationsSearch } from '../hooks/useOrganizationsSearch';
import type { Organization, OrganizationFilters } from '../../domain/types';
import type { OrganizationFormData } from '../../application/validations/organization.schema';

const ITEMS_PER_PAGE = 30;

const defaultFilters: OrganizationFilters = {
  search: '',
  status: 'TODOS',
  countryCode: null,
};

const statusOptions = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ACTIVOS', label: 'Activos', dotColor: 'bg-green-500' },
  { value: 'INACTIVOS', label: 'Inactivos', dotColor: 'bg-red-500' },
];

export function OrganizationsView() {
  const [filters, setFilters] = useState<OrganizationFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selected, setSelected] = useState<Organization | null>(null);

  const { hasPermission } = usePermissions();
  const { data, error } = useOrganizationsSearch(filters, page, ITEMS_PER_PAGE);
  const {
    isLoading,
    createOrganization,
    updateOrganization,
    toggleActive,
    setPrimary,
    updateRegional,
    updateFiscal,
    updateNotifications,
    updateBranding,
  } = useOrganizations();
  const { toasts, removeToast, success, error: showError } = useToast();

  const { data: countAll } = useOrganizationsSearch(
    { search: '', status: 'TODOS', countryCode: null },
    1,
    ITEMS_PER_PAGE,
  );
  const { data: countActive } = useOrganizationsSearch(
    { search: '', status: 'ACTIVOS', countryCode: null },
    1,
    ITEMS_PER_PAGE,
  );
  const { data: countInactive } = useOrganizationsSearch(
    { search: '', status: 'INACTIVOS', countryCode: null },
    1,
    ITEMS_PER_PAGE,
  );
  const statusCounts = {
    TODOS: countAll?.meta.total ?? 0,
    ACTIVOS: countActive?.meta.total ?? 0,
    INACTIVOS: countInactive?.meta.total ?? 0,
  };

  const handleFiltersChange = (f: OrganizationFilters) => {
    setFilters(f);
    setPage(1);
  };

  const handleCreate = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setSelected(org);
    setIsFormOpen(true);
  };

  const handleEditSettings = (org: Organization) => {
    setSelected(org);
    setIsSettingsOpen(true);
  };

  const handleToggleActive = async (org: Organization) => {
    try {
      await toggleActive(org);
      success(org.active ? 'Organización desactivada' : 'Organización activada');
    } catch (err) {
      showError(extractErrorMessage(err, 'No se pudo cambiar el estado'));
    }
  };

  const handleSetPrimary = async (org: Organization) => {
    try {
      await setPrimary(org.id);
      success('Organización marcada como primaria');
    } catch (err) {
      showError(extractErrorMessage(err, 'No se pudo marcar como primaria'));
    }
  };

  const handleSubmit = async (data: OrganizationFormData) => {
    try {
      if (selected) {
        await updateOrganization(selected.id, data);
        success('Organización actualizada');
      } else {
        await createOrganization(data);
        success('Organización creada');
      }
    } catch (err) {
      showError(extractErrorMessage(err, 'Error al guardar'));
      throw err;
    }
  };

  const wrapSettings =
    <T,>(fn: (id: string, data: T) => Promise<unknown>, label: string) =>
    async (data: T) => {
      if (!selected) return;
      try {
        await fn(selected.id, data);
        success(`${label} actualizado`);
      } catch (err) {
        showError(extractErrorMessage(err, `No se pudo guardar ${label.toLowerCase()}`));
      }
    };

  return (
    <>
      <ToastNotifications toasts={toasts} onClose={removeToast} />

      {error && (
        <div className="mb-4 p-4 border-2 border-destructive bg-destructive/10 text-destructive">
          <p className="font-bold">Error:</p>
          <p>{error.message}</p>
        </div>
      )}

      <div className="space-y-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-4 rounded-lg border shadow-sm">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Buscar por razón social, nombre comercial o Tax ID..."
              className="pl-9 w-full bg-transparent"
            />
          </div>
          {hasPermission('CREATE_ORGANIZATION') && (
            <Button size="default" className="gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4 shrink-0" />
              <span className="truncate">Nueva Organización</span>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <OperationalFilters
            options={statusOptions}
            activeFilter={filters.status}
            onFilterChange={(status) =>
              handleFiltersChange({ ...filters, status: status as OrganizationFilters['status'] })
            }
            counts={statusCounts}
          />
          <div className="w-[120px]">
            <Input
              value={filters.countryCode ?? ''}
              onChange={(e) =>
                handleFiltersChange({
                  ...filters,
                  countryCode: e.target.value.toUpperCase() || null,
                })
              }
              placeholder="País (CL)"
              maxLength={2}
            />
          </div>
        </div>
      </div>

      <OrganizationsTable
        organizations={data?.items ?? []}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        onSetPrimary={handleSetPrimary}
        onEditSettings={handleEditSettings}
      />

      <PaginationControls
        currentPage={page}
        totalPages={data?.meta.totalPages ?? 1}
        totalItems={data?.meta.total ?? 0}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />

      <OrganizationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        organization={selected}
        isLoading={isLoading}
      />

      <OrganizationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        organization={selected}
        onSaveRegional={wrapSettings(updateRegional, 'Regional')}
        onSaveFiscal={wrapSettings(updateFiscal, 'Fiscal')}
        onSaveNotifications={wrapSettings(updateNotifications, 'Notificaciones')}
        onSaveBranding={wrapSettings(updateBranding, 'Branding')}
        isLoading={isLoading}
      />
    </>
  );
}
