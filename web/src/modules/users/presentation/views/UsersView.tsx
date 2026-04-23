'use client';

/**
 * Vista principal del módulo Users
 *
 * Integra todos los componentes:
 * - Header con botón crear
 * - Barra de filtros
 * - Tabla de usuarios
 * - Paginación
 * - Modal crear/editar
 */

import { useState } from 'react';
import { Plus, Shield, Search, ChevronDown, User as UserIcon } from 'lucide-react';
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

import { UsersTable } from '../components/UsersTable';
import {
  PaginationControls,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/presentation/components/ui';
import { UserFormModal } from '../components/UserFormModal';
import { RolesManagementModal } from '../components/RolesManagementModal';
import { useUsers } from '../hooks/useUsers';
import { useUsersSearch } from '../hooks/useUsersSearch';
import { useRoles } from '../hooks/useRoles';
import { usePermissions } from '@/modules/auth/presentation/hooks/usePermissions';
import { useAuth } from '@/modules/auth';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { ToastNotifications } from '@/shared/presentation/components/ui/ToastNotifications';
import type { User, UserFilters } from '../../domain/types';
import type { UserFormData } from '../../application/validations/user.schema';

const ITEMS_PER_PAGE = 30;

const defaultFilters: UserFilters = {
  search: '',
  status: 'TODOS',
  roleId: null,
};

const userStatusOptions = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ACTIVOS', label: 'Activos', dotColor: 'bg-green-500' },
  { value: 'INACTIVOS', label: 'Inactivos', dotColor: 'bg-red-500' },
];

export function UsersView() {
  const [filters, setFilters] = useState<UserFilters>(defaultFilters);
  const [page, setPage] = useState(1);

  // Estado para modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Hooks para datos
  const { isLoading: isMutating, createUser, updateUser, toggleUserActive } = useUsers();
  const { data: usersData, error: usersError } = useUsersSearch(filters, page, ITEMS_PER_PAGE);
  const { hasPermission } = usePermissions();
  const { roles, error: rolesError } = useRoles({ enabled: hasPermission('READ_ROLE') });
  const { user: currentUser } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  // Queries para obtener totales por estado
  // IMPORTANTE: El backend solo acepta perPage: 30, 50 o 100, no valores menores
  const { data: countAllData } = useUsersSearch({ search: '', status: 'TODOS', roleId: null }, 1, 30);
  const { data: countActiveData } = useUsersSearch({ search: '', status: 'ACTIVOS', roleId: null }, 1, 30);
  const { data: countInactiveData } = useUsersSearch({ search: '', status: 'INACTIVOS', roleId: null }, 1, 30);

  const statusCounts = {
    TODOS: countAllData?.meta.total ?? 0,
    ACTIVOS: countActiveData?.meta.total ?? 0,
    INACTIVOS: countInactiveData?.meta.total ?? 0,
  };

  const handleFiltersChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleManageRoles = () => {
    setIsRolesModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    if (user.active && currentUser && user.id === currentUser.id) {
      showError('No puedes desactivar tu propio usuario mientras estás conectado');
      return;
    }
    try {
      await toggleUserActive(user);
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        'No se pudo cambiar el estado del usuario'
      );
      console.error('Error al cambiar estado del usuario:', error);
      showError(errorMessage);
    }
  };

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, data);
        success('Usuario actualizado exitosamente');
      } else {
        await createUser(data);
        success('Usuario creado exitosamente');
      }
      setIsFormModalOpen(false);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error al guardar usuario');
      console.error('Error al guardar usuario:', error);
      showError(errorMessage);
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      <ToastNotifications toasts={toasts} onClose={removeToast} />

      {(usersError || rolesError) && (
        <div className="mb-4 p-4 border-2 border-destructive bg-destructive/10 text-destructive">
          <p className="font-bold">Error:</p>
          <p>{usersError?.message ?? rolesError}</p>
        </div>
      )}

      <div className="space-y-4 mb-4">
        {/* Barra superior de Búsqueda rápida y Acciones principales */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-4 rounded-lg border shadow-sm">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Buscar por nombre o email..."
              className="pl-9 w-full bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="default" className="gap-2 w-full sm:w-auto overflow-hidden">
                  <Plus className="h-4 w-4 shrink-0" />
                  <span className="truncate">Nuevo Usuario</span>
                  <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {hasPermission('CREATE_USER') && (
                  <DropdownMenuItem onClick={handleCreateUser} className="gap-2 cursor-pointer">
                    <UserIcon className="h-4 w-4" />
                    Crear Usuario
                  </DropdownMenuItem>
                )}
                {hasPermission('READ_ROLE') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleManageRoles} className="gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      Gestionar Roles
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filtros Operativos (Abajo) */}
        <div className="flex flex-wrap items-center gap-4">
          <OperationalFilters
            options={userStatusOptions}
            activeFilter={filters.status}
            onFilterChange={(status) => handleFiltersChange({ ...filters, status: status as 'TODOS' | 'ACTIVOS' | 'INACTIVOS' })}
            counts={statusCounts}
          />

          <div className="w-[180px]">
            <Select
              value={filters.roleId?.toString() ?? 'TODOS'}
              onValueChange={(value) =>
                handleFiltersChange({
                  ...filters,
                  roleId: value === 'TODOS' ? null : parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los roles</SelectItem>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-0">
        <UsersTable
          users={usersData?.items ?? []}
          onEdit={handleEditUser}
          onToggleActive={handleToggleActive}
        />

        <PaginationControls
          currentPage={page}
          totalPages={usersData?.meta.totalPages ?? 1}
          totalItems={usersData?.meta.total ?? 0}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>

      {/* Modal Crear/Editar Usuario */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        roles={roles || []}
        isLoading={isMutating}
      />

      {/* Modal Gestión de Roles */}
      <RolesManagementModal
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
      />
    </>
  );
}
