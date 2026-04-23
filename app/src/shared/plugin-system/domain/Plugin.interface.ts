/**
 * Contrato de un Plugin del ERP.
 *
 * Un plugin es un módulo NestJS que puede habilitarse/deshabilitarse por organización.
 * Los plugins sólo deben ser wrappers: NO contienen lógica de dominio.
 *
 * - `name`:        Identificador único del plugin (ej: "contacts", "billing").
 * - `module`:      Clase del módulo NestJS a importar.
 * - `permissions`: Permisos que el plugin introduce en el sistema (opcional).
 * - `description`: Descripción legible (opcional).
 * - `version`:     Versión semántica del plugin (opcional).
 * - `isCore`:      Si es true, el módulo está siempre activo para todas las
 *                  organizaciones y el `ModuleGuard` omite la verificación en DB.
 */
import type { Type } from '@nestjs/common';

export interface Plugin {
  name: string;
  module: Type<unknown>;
  permissions?: string[];
  description?: string;
  version?: string;
  isCore?: boolean;
}
