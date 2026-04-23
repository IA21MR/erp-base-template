import { uuidv7 } from 'uuidv7';
import { EntityId } from '../../../../shared/domain/value-objects/EntityId.vo';

export class ContactId extends EntityId {
  static create(value: string): ContactId {
    return new ContactId(value);
  }

  static generate(): ContactId {
    return new ContactId(uuidv7());
  }
}
