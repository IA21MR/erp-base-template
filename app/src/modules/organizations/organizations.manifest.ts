// Manifest del módulo Organizations (opcional).
// Habilita el soporte multi-tenant. Si un proyecto generado no lo incluye,
// el sistema funciona como single-tenant.
import { ModuleManifest } from '../../shared/plugin-system/domain/ModuleManifest';
import { OrganizationsModule } from './Organizations.Module';

export const OrganizationsManifest: ModuleManifest = {
  name: 'organizations',
  description: 'Organizaciones y soporte multi-tenant (opcional)',
  version: '1.0.0',
  isCore: false,
  module: OrganizationsModule,
  dependencies: ['users'],
  permissions: [
    'CREATE_ORGANIZATION',
    'READ_ORGANIZATION',
    'UPDATE_ORGANIZATION',
    'LIST_ORGANIZATIONS',
    'MANAGE_ORGANIZATION_MODULES',
  ],
  prismaFragments: [],
  seedScripts: [],
};
