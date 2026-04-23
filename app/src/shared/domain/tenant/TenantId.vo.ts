/**
 * Value Object: TenantId
 *
 * Identificador tipado (UUID v7) del tenant al que pertenece un agregado core.
 *
 * Vive en `shared/domain` porque el concepto de multi-tenant es transversal:
 * NO pertenece al módulo `organizations` — `organizations` es solo un proveedor
 * (provider) del contexto de tenant. En un proyecto core-only (sin organizations),
 * `TenantId` simplemente no se usa (los agregados core aceptan `TenantId | null`).
 */
import { uuidv7 } from 'uuidv7';
import { EntityId } from '../value-objects/EntityId.vo';

export class TenantId extends EntityId {
  static create(value: string): TenantId {
    return new TenantId(value);
  }

  static generate(): TenantId {
    return new TenantId(uuidv7());
  }
}
