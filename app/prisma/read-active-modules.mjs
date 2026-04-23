/**
 * Helper compartido: lee la lista de módulos activos desde
 * `src/modules.config.ts` y resuelve dependencias transitivas usando
 * los manifests declarados.
 *
 * Fuente única de verdad: `src/modules.config.ts` (ACTIVE_MODULES).
 *
 * Notas:
 *   - Los módulos core (auth, users) siempre se incluyen.
 *   - Se conoce el grafo de dependencias estáticamente aquí porque los
 *     manifests están en TypeScript. Mantener alineado al editar manifests.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULES_CONFIG_PATH = path.resolve(__dirname, '..', 'src', 'modules.config.ts');

// Grafo de dependencias conocido (copia de los manifests en TS).
// Si cambias un manifest, actualiza también esta tabla.
const DEPENDENCIES = {
  auth: ['users'],
  users: [],
  organizations: ['users'],
  contacts: ['users', 'organizations'],
};

const CORE_MODULES = ['auth', 'users'];

export function readActiveModulesConfig() {
  const src = readFileSync(MODULES_CONFIG_PATH, 'utf8');
  // Elimina comentarios de línea y bloque antes de buscar (para no capturar
  // ejemplos dentro de JSDoc).
  const sanitized = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  const match = sanitized.match(
    /export\s+const\s+ACTIVE_MODULES[^=]*=\s*\[([\s\S]*?)\]/,
  );
  if (!match) {
    throw new Error(
      `No se pudo parsear ACTIVE_MODULES en ${MODULES_CONFIG_PATH}`,
    );
  }
  const body = match[1];
  const names = [...body.matchAll(/['"]([a-z0-9_-]+)['"]/g)].map((m) => m[1]);
  return names;
}

export function resolveActiveModules() {
  const requested = readActiveModulesConfig();
  const active = new Set(CORE_MODULES);

  const visit = (name, stack) => {
    if (active.has(name)) return;
    if (stack.includes(name)) {
      throw new Error(
        `Dependencia circular detectada: ${[...stack, name].join(' -> ')}`,
      );
    }
    const deps = DEPENDENCIES[name];
    if (deps === undefined) {
      throw new Error(
        `Módulo desconocido en ACTIVE_MODULES: "${name}". ` +
          `Nombres válidos: ${Object.keys(DEPENDENCIES).join(', ')}`,
      );
    }
    for (const dep of deps) visit(dep, [...stack, name]);
    active.add(name);
  };

  for (const name of requested) visit(name, []);
  return Array.from(active);
}
