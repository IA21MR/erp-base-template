/**
 * Reglas de mapeo permiso → módulo
 *
 * El orden importa: las claves más específicas deben ir primero.
 */
export const PERMISSION_MODULE_RULES: [keyword: string, module: string][] = [
  ['USER', 'USUARIOS'],
  ['PERMISSION', 'ROLES'],
  ['ROLE', 'ROLES'],
];

export const DEFAULT_MODULE = 'OTROS';

export function getModuleFromPermissionCode(code: string): string {
  for (const [key, label] of PERMISSION_MODULE_RULES) {
    if (code.includes(key)) return label;
  }
  return DEFAULT_MODULE;
}
