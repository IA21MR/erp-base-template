import type { LucideIcon } from 'lucide-react';

/**
 * Item de menú declarado por un módulo.
 * Mismo shape que el `MenuItem` de navigation/menu.config.ts.
 */
export interface FrontendMenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Permiso requerido para mostrar el ítem. */
  permission?: string;
  /** Si el usuario tiene este permiso, se oculta el ítem (fallback). */
  hideIfPermission?: string;
  children?: FrontendMenuItem[];
}

/**
 * Manifest de un módulo del frontend.
 *
 * Es intencionalmente más simple que el del backend: el frontend solo
 * necesita saber qué ítems de menú y qué rutas expone cada módulo.
 */
export interface FrontendModuleManifest {
  /** Nombre estable (igual al del backend). */
  name: string;
  /** Ítems del menú principal que contribuye este módulo. */
  menuItems?: FrontendMenuItem[];
  /** Si es core, se incluye siempre aunque no esté en ACTIVE_MODULES. */
  isCore?: boolean;
}
