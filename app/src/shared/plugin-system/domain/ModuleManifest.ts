/**
 * Contrato de un Módulo del ERP (evolución de `Plugin`).
 *
 * Un ModuleManifest describe de forma declarativa TODO lo que un módulo aporta
 * al sistema, para que el generador de proyectos white-label pueda:
 *   - Incluir/excluir el módulo del build final.
 *   - Ensamblar fragmentos Prisma, seeds y permisos dinámicamente.
 *   - Validar dependencias entre módulos al configurar un nuevo proyecto.
 *
 * Este contrato convive con `Plugin` (runtime) y lo amplía con metadata de
 * build-time. `Plugin` se mantiene por compatibilidad con `PluginRegistry`.
 */
import type { Type } from '@nestjs/common';

export interface ModuleManifest {
  /** Identificador único en minúsculas (ej: "contacts"). */
  name: string;

  /** Descripción legible para el wizard del generador. */
  description: string;

  /** Versión semántica del módulo. */
  version: string;

  /**
   * Si es core, siempre está activo y no puede ser deshabilitado por el
   * generador ni por el `ModuleGuard`.
   */
  isCore: boolean;

  /** Clase del módulo NestJS a importar en `AppModule`. */
  module: Type<unknown>;

  /**
   * Nombres de módulos de los que depende. El generador debe incluirlos
   * transitivamente si el usuario selecciona este módulo.
   */
  dependencies: string[];

  /**
   * Permisos (códigos) que el módulo introduce en el sistema.
   * Se usan tanto en runtime (registro) como en seeds generados.
   */
  permissions: string[];

  /**
   * Rutas relativas (desde la raíz del proyecto) a fragmentos Prisma propios
   * del módulo. El script de ensamblado los concatenará en `schema.prisma`.
   * Ejemplo: ["prisma/modules/contacts.prisma"]
   */
  prismaFragments: string[];

  /**
   * Rutas relativas a scripts de seed específicos del módulo.
   * Ejemplo: ["prisma/seeds/contacts.seed.mjs"]
   */
  seedScripts: string[];
}
