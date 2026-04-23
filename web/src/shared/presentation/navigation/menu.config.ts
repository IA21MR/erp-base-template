/**
 * Configuración del menú de navegación.
 *
 * Los ítems ya NO se declaran aquí. Cada módulo los declara en su
 * manifest (`web/src/shared/plugin-system/manifests.ts`), y aquí solo
 * se concatenan los de los módulos activos.
 */
import { buildActiveMenu } from '@/shared/plugin-system';
import type { FrontendMenuItem } from '@/shared/plugin-system';

export type MenuItem = FrontendMenuItem;

/** Menú principal — derivado de manifests de módulos activos. */
export const mainMenu: MenuItem[] = buildActiveMenu();

/** Menú secundario (configuración, perfil, etc.) */
export const secondaryMenu: MenuItem[] = [];
