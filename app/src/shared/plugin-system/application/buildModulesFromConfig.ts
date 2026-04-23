// Builder de imports dinámicos para AppModule.
// Resuelve dependencias entre módulos, garantiza que los `isCore` siempre
// estén presentes, y devuelve la lista de clases de módulo NestJS lista para
// inyectar en `@Module({ imports: [...] })`.
import type { Type } from '@nestjs/common';
import { MODULE_CATALOG, getManifest } from './ModuleCatalog';
import type { ModuleManifest } from '../domain/ModuleManifest';

/**
 * Resuelve las dependencias transitivas de los módulos solicitados y
 * añade todos los módulos `isCore`. El orden de salida respeta dependencias:
 * un módulo siempre aparece después de sus dependencias.
 */
export function resolveActiveManifests(
  requestedNames: ReadonlyArray<string>,
): ModuleManifest[] {
  const selected = new Map<string, ModuleManifest>();

  // 1. Añadir siempre los core.
  for (const m of MODULE_CATALOG) {
    if (m.isCore) selected.set(m.name, m);
  }

  // 2. Añadir los solicitados + sus dependencias (DFS).
  const visit = (name: string, stack: string[]): void => {
    if (selected.has(name)) return;
    if (stack.includes(name)) {
      throw new Error(
        `Dependencia circular detectada: ${[...stack, name].join(' -> ')}`,
      );
    }
    const manifest = getManifest(name);
    for (const dep of manifest.dependencies) {
      visit(dep, [...stack, name]);
    }
    selected.set(name, manifest);
  };

  for (const name of requestedNames) {
    visit(name, []);
  }

  // 3. Orden topológico: el Map ya preserva el orden de inserción tras DFS.
  return Array.from(selected.values());
}

/**
 * Convierte una lista de nombres de módulos activos en las clases NestJS
 * correspondientes, listas para `imports: [...]` de `AppModule`.
 */
export function buildModulesFromConfig(
  activeModuleNames: ReadonlyArray<string>,
): Type<unknown>[] {
  return resolveActiveManifests(activeModuleNames).map((m) => m.module);
}
