import { Plugin } from '../../../shared/plugin-system/domain/Plugin.interface';
import { ContactsModule } from '../Contacts.Module';

/**
 * Wrapper del módulo de Contactos como Plugin.
 *
 * NO modifica la lógica de dominio del módulo de Contactos.
 * Solo lo expone bajo el contrato `Plugin` para registrarlo
 * en el `PluginRegistry` del core.
 */
export const ContactsPlugin: Plugin = {
  name: 'contacts',
  module: ContactsModule,
  description: 'Gestión de contactos (personas/empresas) por organización',
  version: '1.0.0',
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
};
