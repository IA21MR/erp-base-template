/**
 * Configuración de módulos activos para ESTE proyecto.
 *
 * ⚠️  TEMPLATE BASE: solo módulos core.
 *
 * Los módulos del catálogo (ver `src/shared/plugin-system/application/ModuleCatalog.ts`)
 * marcados como `isCore: true` se incluyen SIEMPRE aunque no estén listados aquí.
 * Los opcionales (contacts, organizations, ...) se activan añadiendo su nombre.
 *
 * El generador de proyectos reescribe esta lista para cada cliente.
 *
 * Ejemplo para un proyecto con contactos:
 *   export const ACTIVE_MODULES = ['contacts'] as const;
 *
 * Ejemplo para un proyecto multi-tenant con contactos:
 *   export const ACTIVE_MODULES = ['organizations', 'contacts'] as const;
 */
export const ACTIVE_MODULES: ReadonlyArray<string> = [
  // Template base: todos los módulos opcionales activos para que compile y
  // los tests pasen. El generador de proyectos reescribe esta lista al
  // clonar el template para un cliente concreto.
  'organizations',
  'contacts',
];
