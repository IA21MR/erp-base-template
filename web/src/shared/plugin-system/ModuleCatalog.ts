/**
 * Catálogo de módulos frontend disponibles en ESTE proyecto.
 * El generador reescribe este archivo al clonar el template.
 */
import type { FrontendModuleManifest } from './FrontendModuleManifest';
import {
  AuthManifest,
  UsersManifest,
  OrganizationsManifest,
  ContactsManifest,
} from './manifests';

export const MODULE_CATALOG: ReadonlyArray<FrontendModuleManifest> = [
  AuthManifest,
  UsersManifest,
  OrganizationsManifest,
  ContactsManifest,
];
