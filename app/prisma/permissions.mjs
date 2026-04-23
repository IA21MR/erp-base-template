export const USER_PERMISSIONS = [
  { code: 'CREATE_USER', description: 'Crear usuarios del sistema' },
  { code: 'READ_USER', description: 'Ver usuarios del sistema' },
  { code: 'UPDATE_USER', description: 'Editar usuarios existentes' },
  { code: 'ACTIVATE_USER', description: 'Activar usuarios' },
  { code: 'DEACTIVATE_USER', description: 'Desactivar usuarios' },
  { code: 'LIST_USERS', description: 'Visualizar lista de usuarios' },
  { code: 'VIEW_USER_HISTORY', description: 'Ver historial de cambios de usuarios' },
];

export const ROLE_PERMISSIONS = [
  { code: 'ASSIGN_ROLES', description: 'Asignar roles a usuarios' },
  { code: 'REMOVE_ROLES', description: 'Remover roles de usuarios' },
  { code: 'CREATE_ROLE', description: 'Crear nuevos roles' },
  { code: 'READ_ROLE', description: 'Ver roles del sistema' },
  { code: 'UPDATE_ROLE', description: 'Editar roles existentes' },
  { code: 'DELETE_ROLE', description: 'Eliminar roles no asignados' },
  { code: 'MANAGE_PERMISSIONS', description: 'Gestionar permisos del sistema' },
];

export const ORGANIZATION_PERMISSIONS = [
  { code: 'CREATE_ORGANIZATION', description: 'Crear organizaciones' },
  { code: 'READ_ORGANIZATION', description: 'Ver organizaciones' },
  { code: 'UPDATE_ORGANIZATION', description: 'Editar datos de organizaciones' },
  { code: 'ACTIVATE_ORGANIZATION', description: 'Activar organizaciones' },
  { code: 'DEACTIVATE_ORGANIZATION', description: 'Desactivar organizaciones' },
  { code: 'MANAGE_ORGANIZATION_SETTINGS', description: 'Gestionar configuración de la organización' },
  { code: 'SET_PRIMARY_ORGANIZATION', description: 'Marcar la organización primaria del sistema' },
  { code: 'MANAGE_ORGANIZATION_MODULES', description: 'Habilitar y deshabilitar módulos por organización' },
];

export const CONTACT_PERMISSIONS = [
  { code: 'CREATE_CONTACT', description: 'Crear contactos' },
  { code: 'READ_CONTACT', description: 'Ver contactos' },
  { code: 'UPDATE_CONTACT', description: 'Editar contactos' },
  { code: 'ACTIVATE_CONTACT', description: 'Activar contactos' },
  { code: 'DEACTIVATE_CONTACT', description: 'Desactivar contactos' },
  { code: 'MANAGE_CONTACT_ROLES', description: 'Gestionar roles de contactos' },
  { code: 'LIST_CONTACTS', description: 'Visualizar lista de contactos' },
  { code: 'VIEW_CONTACT_ROLE_TYPES', description: 'Ver catálogo de tipos de rol de contacto' },
  { code: 'ASSIGN_CONTACT', description: 'Asignar contactos a usuarios (CRM)' },
];

export const ALL_PERMISSIONS = [
  ...USER_PERMISSIONS,
  ...ROLE_PERMISSIONS,
  ...ORGANIZATION_PERMISSIONS,
  ...CONTACT_PERMISSIONS,
];