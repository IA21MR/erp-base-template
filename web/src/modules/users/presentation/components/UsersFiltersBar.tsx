'use client';

/**
 * Barra de filtros para usuarios
 *
 * - Búsqueda por nombre/email
 * - Filtro por estado (activo/inactivo)
 * - Filtro por rol
 * - Botón limpiar filtros
 */

import { FiltersBar } from '@/shared/presentation/components/ui/FiltersBar';
import { SearchInput } from '@/shared/presentation/components/ui/SearchInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/Select';
import type { UserFilters, RoleSimple } from '../../domain/types';

interface UsersFiltersBarProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onClearFilters: () => void;
  roles?: RoleSimple[];
}

export function UsersFiltersBar({
  filters,
  onFiltersChange,
  onClearFilters,
  roles = [],
}: UsersFiltersBarProps) {
  const hasActiveFilters =
    filters.search !== '' || 
    filters.status !== 'TODOS' || 
    filters.roleId !== null;

  return (
    <FiltersBar hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <SearchInput
            placeholder="Buscar por nombre o email..."
            value={filters.search}
            onChange={(value) => onFiltersChange({ ...filters, search: value })}
          />
        </div>

        <div>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value as 'TODOS' | 'ACTIVOS' | 'INACTIVOS',
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="ACTIVOS">Activos</SelectItem>
              <SelectItem value="INACTIVOS">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={filters.roleId?.toString() ?? 'TODOS'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                roleId: value === 'TODOS' ? null : parseInt(value),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </FiltersBar>
  );
}
