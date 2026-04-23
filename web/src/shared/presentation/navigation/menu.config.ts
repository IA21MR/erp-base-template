/**
 * Configuración centralizada del menú de navegación
 *
 * - Cada módulo se registra aquí
 * - Fácil de extender
 * - Iconos de Lucide React
 * - Soporte para submenús (futuro)
 */

import {
  LayoutDashboard,
  UserCog,
  Shield,
  Building2,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  // Permiso requerido para mostrar el ítem
  permission?: string;
  // Si el usuario TIENE este permiso, ocultar el ítem (usado para fallbacks)
  hideIfPermission?: string;
  // Submenú (futuro)
  children?: MenuItem[];
}

/**
 * Menú principal del dashboard
 * Agregar nuevos módulos aquí
 */
export const mainMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Inicio',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'organizations',
    label: 'Organizaciones',
    href: '/organizations',
    icon: Building2,
    permission: 'READ_ORGANIZATION',
  },
  {
    id: 'contacts',
    label: 'Contactos',
    href: '/contacts',
    icon: Users,
    permission: 'READ_CONTACT',
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
];

/**
 * Menú secundario (configuración, perfil, etc.)
 */
export const secondaryMenu: MenuItem[] = [];
