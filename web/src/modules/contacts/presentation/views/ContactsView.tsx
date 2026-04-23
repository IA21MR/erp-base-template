'use client';

/**
 * Vista principal del módulo Contacts.
 */
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { extractErrorMessage } from '@/shared/utils';

import { OperationalFilters } from '@/shared/presentation/components/ui/OperationalFilters';
import { Input } from '@/shared/presentation/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/Select';
import {
  PaginationControls,
  Button,
} from '@/shared/presentation/components/ui';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { ToastNotifications } from '@/shared/presentation/components/ui/ToastNotifications';
import { usePermissions } from '@/modules/auth/presentation/hooks/usePermissions';

import { ContactsTable } from '../components/ContactsTable';
import { ContactFormModal } from '../components/ContactFormModal';
import { useContacts } from '../hooks/useContacts';
import { useContactsSearch } from '../hooks/useContactsSearch';
import { useContactRoleTypes } from '../hooks/useContactRoleTypes';
import type { Contact, ContactFilters } from '../../domain/types';
import type { ContactFormData } from '../../application/validations/contact.schema';

const ITEMS_PER_PAGE = 30;

const defaultFilters: ContactFilters = {
  search: '',
  status: 'TODOS',
  type: null,
  organizationId: null,
  roleTypeId: null,
  assignedToUserId: null,
};

const statusOptions = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ACTIVOS', label: 'Activos', dotColor: 'bg-green-500' },
  { value: 'INACTIVOS', label: 'Inactivos', dotColor: 'bg-red-500' },
];

export function ContactsView() {
  const [filters, setFilters] = useState<ContactFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);

  const { hasPermission } = usePermissions();
  const { data, error } = useContactsSearch(filters, page, ITEMS_PER_PAGE);
  const { data: roleTypes } = useContactRoleTypes({
    enabled: hasPermission('VIEW_CONTACT_ROLE_TYPES'),
  });
  const { isLoading, createContact, updateContact, toggleActive } = useContacts();
  const { toasts, removeToast, success, error: showError } = useToast();

  const baseFilters: ContactFilters = {
    search: '',
    status: 'TODOS',
    type: null,
    organizationId: null,
    roleTypeId: null,
    assignedToUserId: null,
  };
  const { data: countAll } = useContactsSearch(baseFilters, 1, ITEMS_PER_PAGE);
  const { data: countActive } = useContactsSearch(
    { ...baseFilters, status: 'ACTIVOS' },
    1,
    ITEMS_PER_PAGE,
  );
  const { data: countInactive } = useContactsSearch(
    { ...baseFilters, status: 'INACTIVOS' },
    1,
    ITEMS_PER_PAGE,
  );
  const statusCounts = {
    TODOS: countAll?.meta.total ?? 0,
    ACTIVOS: countActive?.meta.total ?? 0,
    INACTIVOS: countInactive?.meta.total ?? 0,
  };

  const handleFiltersChange = (f: ContactFilters) => {
    setFilters(f);
    setPage(1);
  };

  const handleCreate = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const handleEdit = (c: Contact) => {
    setSelected(c);
    setIsFormOpen(true);
  };

  const handleToggleActive = async (c: Contact) => {
    try {
      await toggleActive(c);
      success(c.active ? 'Contacto desactivado' : 'Contacto activado');
    } catch (err) {
      showError(extractErrorMessage(err, 'No se pudo cambiar el estado'));
    }
  };

  const handleSubmit = async (form: ContactFormData) => {
    try {
      if (selected) {
        await updateContact(selected.id, form);
        success('Contacto actualizado');
      } else {
        await createContact(form);
        success('Contacto creado');
      }
    } catch (err) {
      showError(extractErrorMessage(err, 'Error al guardar'));
      throw err;
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
              placeholder="Buscar por nombre, razón social, tax ID, email..."
              className="pl-9 w-full bg-transparent"
            />
          </div>
          {hasPermission('CREATE_CONTACT') && (
            <Button size="default" className="gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4 shrink-0" />
              <span className="truncate">Nuevo Contacto</span>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <OperationalFilters
            options={statusOptions}
            activeFilter={filters.status}
            onFilterChange={(status) =>
              handleFiltersChange({ ...filters, status: status as ContactFilters['status'] })
            }
            counts={statusCounts}
          />
          <div className="w-[160px]">
            <Select
              value={filters.type ?? 'ALL'}
              onValueChange={(v) =>
                handleFiltersChange({
                  ...filters,
                  type: v === 'ALL' ? null : (v as 'PERSON' | 'COMPANY'),
                })
              }
            >
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PERSON">Personas</SelectItem>
                <SelectItem value="COMPANY">Empresas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {roleTypes && roleTypes.length > 0 && (
            <div className="w-[220px]">
              <Select
                value={filters.roleTypeId ?? 'ALL'}
                onValueChange={(v) =>
                  handleFiltersChange({
                    ...filters,
                    roleTypeId: v === 'ALL' ? null : v,
                  })
                }
              >
                <SelectTrigger><SelectValue placeholder="Rol" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los roles</SelectItem>
                  {roleTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <ContactsTable
        contacts={data?.items ?? []}
        roleTypes={roleTypes ?? []}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
      />

      <PaginationControls
        currentPage={page}
        totalPages={data?.meta.totalPages ?? 1}
        totalItems={data?.meta.total ?? 0}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />

      <ContactFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        contact={selected}
        roleTypes={roleTypes ?? []}
        isLoading={isLoading}
      />
    </>
  );
}
