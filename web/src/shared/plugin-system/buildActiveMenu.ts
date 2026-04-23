/**
 * Resuelve los manifests activos (core + opt-in) y expone builders
 * listos para consumir desde el layout / sidebar.
 */
import type { FrontendMenuItem, FrontendModuleManifest } from './FrontendModuleManifest';
import { MODULE_CATALOG } from './ModuleCatalog';
import { ACTIVE_MODULES } from '../../modules.config';

export function resolveActiveFrontendManifests(): FrontendModuleManifest[] {
  const active = new Set<string>([...ACTIVE_MODULES]);
  return MODULE_CATALOG.filter((m) => m.isCore || active.has(m.name));
}

export function buildActiveMenu(): FrontendMenuItem[] {
  return resolveActiveFrontendManifests().flatMap((m) => m.menuItems ?? []);
}
