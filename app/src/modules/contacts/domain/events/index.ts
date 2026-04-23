import { DomainEvent } from '../../../../shared/domain/events/DomainEvent';

const AGG = 'Contact';

export class ContactCreatedEvent extends DomainEvent<{
  contactId: string;
  organizationId: string;
  type: 'PERSON' | 'COMPANY';
  createdByUserId: number;
}> {
  constructor(payload: {
    contactId: string;
    organizationId: string;
    type: 'PERSON' | 'COMPANY';
    createdByUserId: number;
  }) {
    super(payload.contactId, AGG, payload);
  }
}

export class ContactUpdatedEvent extends DomainEvent<{
  contactId: string;
  changedFields: string[];
  updatedByUserId: number;
}> {
  constructor(payload: { contactId: string; changedFields: string[]; updatedByUserId: number }) {
    super(payload.contactId, AGG, payload);
  }
}

export class ContactActivatedEvent extends DomainEvent<{ contactId: string; updatedByUserId: number }> {
  constructor(payload: { contactId: string; updatedByUserId: number }) {
    super(payload.contactId, AGG, payload);
  }
}

export class ContactDeactivatedEvent extends DomainEvent<{ contactId: string; updatedByUserId: number }> {
  constructor(payload: { contactId: string; updatedByUserId: number }) {
    super(payload.contactId, AGG, payload);
  }
}

export class ContactRoleAddedEvent extends DomainEvent<{
  contactId: string;
  roleTypeId: string;
  updatedByUserId: number;
}> {
  constructor(payload: { contactId: string; roleTypeId: string; updatedByUserId: number }) {
    super(payload.contactId, AGG, payload);
  }
}

export class ContactRoleRemovedEvent extends DomainEvent<{
  contactId: string;
  roleTypeId: string;
  updatedByUserId: number;
}> {
  constructor(payload: { contactId: string; roleTypeId: string; updatedByUserId: number }) {
    super(payload.contactId, AGG, payload);
  }
}

export class ContactAssignedEvent extends DomainEvent<{
  contactId: string;
  assignedToUserId: number | null;
  updatedByUserId: number;
}> {
  constructor(payload: {
    contactId: string;
    assignedToUserId: number | null;
    updatedByUserId: number;
  }) {
    super(payload.contactId, AGG, payload);
  }
}
