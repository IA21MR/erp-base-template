// Compatibilidad retro: reexporta los permisos divididos por módulo.
// Nuevas referencias deben importar desde prisma/permissions/<modulo>.mjs.
import { CORE_PERMISSIONS } from './permissions/core.mjs';
import { ORGANIZATIONS_PERMISSIONS } from './permissions/organizations.mjs';
import { CONTACTS_PERMISSIONS } from './permissions/contacts.mjs';

export { CORE_PERMISSIONS } from './permissions/core.mjs';
export { ORGANIZATIONS_PERMISSIONS } from './permissions/organizations.mjs';
export { CONTACTS_PERMISSIONS } from './permissions/contacts.mjs';

// Alias heredados (por compatibilidad con código existente).
export const USER_PERMISSIONS = CORE_PERMISSIONS.slice(0, 7);
export const ROLE_PERMISSIONS = CORE_PERMISSIONS.slice(7);
export const ORGANIZATION_PERMISSIONS = ORGANIZATIONS_PERMISSIONS;
export const CONTACT_PERMISSIONS = CONTACTS_PERMISSIONS;

export const ALL_PERMISSIONS = [
  ...CORE_PERMISSIONS,
  ...ORGANIZATIONS_PERMISSIONS,
  ...CONTACTS_PERMISSIONS,
];
