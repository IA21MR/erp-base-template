// Registro central de todos los módulos disponibles en el ERP.
// El generador de proyectos lee este catálogo, filtra por los módulos
// seleccionados, y produce un `modules.config.ts` específico del proyecto.
import { ModuleManifest } from '../domain/ModuleManifest';
import { AuthManifest } from '../../../modules/auth/auth.manifest';
import { UsersManifest } from '../../../modules/users/users.manifest';
import { OrganizationsManifest } from '../../../modules/organizations/organizations.manifest';
import { ContactsManifest } from '../../../modules/contacts/contacts.manifest';

/**
 * Catálogo completo de módulos disponibles en el template base.
 * No implica que todos estén activos — la activación depende de
 * `modules.config.ts` (ver `ACTIVE_MODULES`).
 */
export const MODULE_CATALOG: ReadonlyArray<ModuleManifest> = [
  AuthManifest,
  UsersManifest,
  OrganizationsManifest,
  ContactsManifest,
];

/** Devuelve un manifest por nombre o lanza si no existe. */
export function getManifest(name: string): ModuleManifest {
  const m = MODULE_CATALOG.find((x) => x.name === name);
  if (!m) {
    throw new Error(`ModuleManifest no encontrado: "${name}"`);
  }
  return m;
}
