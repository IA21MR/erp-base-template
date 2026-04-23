/**
 * Value Object: EntityId (base genérico para IDs UUID)
 *
 * Usa UUID v7 (ordenable temporalmente). Sub-clases tipadas (OrganizationId, ContactId, ...)
 * lo extienden para evitar mezclar IDs entre módulos.
 */
import { uuidv7 } from 'uuidv7';

const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export abstract class EntityId {
  protected constructor(public readonly value: string) {
    if (!value || !UUID_V7_REGEX.test(value)) {
      throw new Error(`${new.target.name} inválido: debe ser UUID v7`);
    }
  }

  equals(other: EntityId): boolean {
    return this.value === other.value && this.constructor === other.constructor;
  }

  toString(): string {
    return this.value;
  }

  /**
   * Genera un nuevo UUID v7. Usar desde factories estáticos de sub-clases.
   */
  protected static newId(): string {
    return uuidv7();
  }
}
