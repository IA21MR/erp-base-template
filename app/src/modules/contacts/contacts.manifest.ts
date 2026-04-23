// Manifest del módulo Contacts (opcional).
import { ModuleManifest } from '../../shared/plugin-system/domain/ModuleManifest';
import { ContactsModule } from './Contacts.Module';

export const ContactsManifest: ModuleManifest = {
  name: 'contacts',
  description: 'Gestión de contactos (personas/empresas) con roles, emails, teléfonos y direcciones',
  version: '1.0.0',
  isCore: false,
  module: ContactsModule,
  dependencies: ['users', 'organizations'],
  permissions: [
    'CREATE_CONTACT',
    'READ_CONTACT',
    'UPDATE_CONTACT',
    'ACTIVATE_CONTACT',
    'DEACTIVATE_CONTACT',
    'MANAGE_CONTACT_ROLES',
    'LIST_CONTACTS',
    'VIEW_CONTACT_ROLE_TYPES',
    'ASSIGN_CONTACT',
  ],
  prismaFragments: ['prisma/fragments/contacts.prisma'],
  seedScripts: ['prisma/seeds/contacts.seed.mjs'],
};
