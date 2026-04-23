/**
 * Value Object: OrganizationId
 * Identificador tipado (UUID v7) para Organization.
 */
import { uuidv7 } from 'uuidv7';
import { EntityId } from '../../../../shared/domain/value-objects/EntityId.vo';

export class OrganizationId extends EntityId {
  static create(value: string): OrganizationId {
    return new OrganizationId(value);
  }

  static generate(): OrganizationId {
    return new OrganizationId(uuidv7());
  }
}
