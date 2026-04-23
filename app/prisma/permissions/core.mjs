// Permisos del módulo core (users + roles).
export const CORE_PERMISSIONS = [
  // USER_PERMISSIONS
  { code: 'CREATE_USER', description: 'Crear usuarios del sistema' },
  { code: 'READ_USER', description: 'Ver usuarios del sistema' },
  { code: 'UPDATE_USER', description: 'Editar usuarios existentes' },
  { code: 'ACTIVATE_USER', description: 'Activar usuarios' },
  { code: 'DEACTIVATE_USER', description: 'Desactivar usuarios' },
  { code: 'LIST_USERS', description: 'Visualizar lista de usuarios' },
  { code: 'VIEW_USER_HISTORY', description: 'Ver historial de cambios de usuarios' },
  // ROLE_PERMISSIONS
  { code: 'ASSIGN_ROLES', description: 'Asignar roles a usuarios' },
  { code: 'REMOVE_ROLES', description: 'Remover roles de usuarios' },
  { code: 'CREATE_ROLE', description: 'Crear nuevos roles' },
  { code: 'READ_ROLE', description: 'Ver roles del sistema' },
  { code: 'UPDATE_ROLE', description: 'Editar roles existentes' },
  { code: 'DELETE_ROLE', description: 'Eliminar roles no asignados' },
  { code: 'MANAGE_PERMISSIONS', description: 'Gestionar permisos del sistema' },
];
