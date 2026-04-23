/**
 * Tipos del módulo Users
 */

export interface Permission {
  id: number;
  code: string;
  description: string | null;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface PermissionsByModule {
  module: string;
  permissions: Permission[];
}

export interface RoleSimple {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  roles: RoleSimple[];
  createdAt?: string;
}

export interface UserFilters {
  search: string;
  status: 'TODOS' | 'ACTIVOS' | 'INACTIVOS';
  roleId?: number | null;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
