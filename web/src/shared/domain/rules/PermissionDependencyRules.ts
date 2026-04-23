/**
 * Reglas de dominio: Dependencias entre permisos (Frontend)
 *
 * Espejo exacto de:
 *   app/src/shared/domain/rules/PermissionDependencyRules.ts
 *
 * Regla de negocio: No debe existir un permiso de acción sin su permiso base de lectura.
 */

/**
 * Mapa de dependencias: permiso → permisos base requeridos (al menos uno).
 */
export const PERMISSION_DEPENDENCIES: Record<string, string[]> = {
  // USUARIOS
  CREATE_USER: ['LIST_USERS', 'READ_USER'],
  UPDATE_USER: ['LIST_USERS', 'READ_USER'],
  ACTIVATE_USER: ['LIST_USERS', 'READ_USER'],
  DEACTIVATE_USER: ['LIST_USERS', 'READ_USER'],
  VIEW_USER_HISTORY: ['LIST_USERS', 'READ_USER'],

  // ROLES
  CREATE_ROLE: ['READ_ROLE'],
  UPDATE_ROLE: ['READ_ROLE'],
  DELETE_ROLE: ['READ_ROLE'],
  ASSIGN_ROLES: ['READ_ROLE', 'LIST_USERS', 'READ_USER'],
  REMOVE_ROLES: ['READ_ROLE', 'LIST_USERS', 'READ_USER'],
  MANAGE_PERMISSIONS: ['READ_ROLE'],
};

/**
 * Valida la coherencia de un conjunto de códigos de permisos.
 * @returns Array de mensajes de error (vacío si todo es válido)
 */
export function validatePermissionCoherence(permissionCodes: string[]): string[] {
  const errors: string[] = [];
  const codeSet = new Set(permissionCodes);

  for (const code of permissionCodes) {
    const requiredBases = PERMISSION_DEPENDENCIES[code];
    if (!requiredBases) continue;

    const hasBase = requiredBases.some((base) => codeSet.has(base));
    if (!hasBase) {
      const basesStr = requiredBases.join(' o ');
      errors.push(
        `El permiso "${code}" requiere al menos uno de: ${basesStr}`,
      );
    }
  }

  return errors;
}

/**
 * Dado un conjunto de códigos de permisos, retorna los permisos base
 * que deben auto-seleccionarse para mantener coherencia.
 */
export function getMissingBasePermissions(permissionCodes: string[]): string[] {
  const codeSet = new Set(permissionCodes);
  const missing: Set<string> = new Set();

  for (const code of permissionCodes) {
    const requiredBases = PERMISSION_DEPENDENCIES[code];
    if (!requiredBases) continue;

    const hasBase = requiredBases.some((base) => codeSet.has(base));
    if (!hasBase) {
      missing.add(requiredBases[0]);
    }
  }

  return Array.from(missing);
}
