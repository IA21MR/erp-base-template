/**
 * Manifests de cada módulo del frontend.
 *
 * Cada módulo declara los ítems de menú que aporta al sidebar.
 */
import { LayoutDashboard, UserCog, Shield, Building2, Users } from 'lucide-react';
import type { FrontendModuleManifest } from './FrontendModuleManifest';

export const AuthManifest: FrontendModuleManifest = {
  name: 'auth',
  isCore: true,
  // No aporta menú (login/reset están fuera del dashboard).
  menuItems: [],
};

export const UsersManifest: FrontendModuleManifest = {
  name: 'users',
  isCore: true,
  menuItems: [
    {
      id: 'dashboard',
      label: 'Inicio',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'users',
      label: 'Usuarios',
      href: '/users',
      icon: UserCog,
      permission: 'LIST_USERS',
    },
    {
      id: 'roles',
      label: 'Roles',
      href: '/roles',
      icon: Shield,
      permission: 'READ_ROLE',
      hideIfPermission: 'LIST_USERS',
    },
  ],
};

export const OrganizationsManifest: FrontendModuleManifest = {
  name: 'organizations',
  menuItems: [
    {
      id: 'organizations',
      label: 'Organizaciones',
      href: '/organizations',
      icon: Building2,
      permission: 'READ_ORGANIZATION',
    },
  ],
};

export const ContactsManifest: FrontendModuleManifest = {
  name: 'contacts',
  menuItems: [
    {
      id: 'contacts',
      label: 'Contactos',
      href: '/contacts',
      icon: Users,
      permission: 'READ_CONTACT',
    },
  ],
};
