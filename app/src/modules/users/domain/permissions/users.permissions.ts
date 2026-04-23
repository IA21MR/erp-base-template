/**
 * Permisos del Módulo Users
 *
 * Centraliza la definición de permisos para gestión de usuarios y roles.
 * El seeder los importa para crear en la base de datos.
 */

// ============================================
// CÓDIGOS DE PERMISOS (Type-Safe)
// ============================================

export const USER_PERMISSION_CODES = {
  // RF-U1: Gestión de usuarios
  CREATE: 'CREATE_USER',
  READ: 'READ_USER',
  UPDATE: 'UPDATE_USER',
  ACTIVATE: 'ACTIVATE_USER',
  DEACTIVATE: 'DEACTIVATE_USER',

  // RF-U2: Listado de usuarios
  LIST: 'LIST_USERS',

  // Historial
  VIEW_HISTORY: 'VIEW_USER_HISTORY',
} as const;

export const ROLE_PERMISSION_CODES = {
  // RF-R1: Asignación de roles
  ASSIGN: 'ASSIGN_ROLES',
  REMOVE: 'REMOVE_ROLES',

  // RF-R3: Gestión de roles
  CREATE: 'CREATE_ROLE',
  READ: 'READ_ROLE',
  UPDATE: 'UPDATE_ROLE',
  DELETE: 'DELETE_ROLE',

  // Permisos administrativos
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
} as const;

export type UserPermissionCode =
  (typeof USER_PERMISSION_CODES)[keyof typeof USER_PERMISSION_CODES];

export type RolePermissionCode =
  (typeof ROLE_PERMISSION_CODES)[keyof typeof ROLE_PERMISSION_CODES];

// ============================================
// DEFINICIÓN DE PERMISOS PARA SEEDER
// ============================================

import { PermissionDefinition } from '../../../../shared/domain/PermissionDefinition';

export const USER_PERMISSIONS: PermissionDefinition[] = [
  // RF-U1: Gestión de usuarios
  {
    code: USER_PERMISSION_CODES.CREATE,
    description: 'Crear usuarios del sistema',
  },
  { code: USER_PERMISSION_CODES.READ, description: 'Ver usuarios del sistema' },
  {
    code: USER_PERMISSION_CODES.UPDATE,
    description: 'Editar usuarios existentes',
  },
  { code: USER_PERMISSION_CODES.ACTIVATE, description: 'Activar usuarios' },
  {
    code: USER_PERMISSION_CODES.DEACTIVATE,
    description: 'Desactivar usuarios',
  },

  // RF-U2: Listado
  {
    code: USER_PERMISSION_CODES.LIST,
    description: 'Visualizar lista de usuarios con estado y roles',
  },

  // Historial
  {
    code: USER_PERMISSION_CODES.VIEW_HISTORY,
    description: 'Ver historial de cambios de usuarios (solo admin)',
  },
];

export const ROLE_PERMISSIONS: PermissionDefinition[] = [
  // RF-R1: Asignación de roles
  {
    code: ROLE_PERMISSION_CODES.ASSIGN,
    description: 'Asignar roles a usuarios',
  },
  {
    code: ROLE_PERMISSION_CODES.REMOVE,
    description: 'Remover roles de usuarios',
  },

  // RF-R3: Gestión de roles
  { code: ROLE_PERMISSION_CODES.CREATE, description: 'Crear nuevos roles' },
  { code: ROLE_PERMISSION_CODES.READ, description: 'Ver roles del sistema' },
  {
    code: ROLE_PERMISSION_CODES.UPDATE,
    description: 'Editar roles existentes',
  },
  {
    code: ROLE_PERMISSION_CODES.DELETE,
    description: 'Eliminar roles no asignados',
  },

  // Admin
  {
    code: ROLE_PERMISSION_CODES.MANAGE_PERMISSIONS,
    description: 'Gestionar permisos del sistema',
  },
];

// ============================================
// PERMISOS POR ROL (Sugeridos)
// ============================================

/**
 * Permisos que debería tener un Operario para users
 */
export const USER_OPERATOR_PERMISSIONS: string[] = [
  USER_PERMISSION_CODES.READ,
  USER_PERMISSION_CODES.LIST,
];
