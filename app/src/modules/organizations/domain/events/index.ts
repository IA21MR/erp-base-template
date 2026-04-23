/**
 * Eventos de dominio del aggregate Organization.
 */
import { DomainEvent } from '../../../../shared/domain/events/DomainEvent';

const AGG_TYPE = 'Organization';

export class OrganizationCreatedEvent extends DomainEvent<{
  organizationId: string;
  legalName: string;
  countryCode: string;
  isPrimary: boolean;
  createdByUserId: number;
}> {
  constructor(payload: {
    organizationId: string;
    legalName: string;
    countryCode: string;
    isPrimary: boolean;
    createdByUserId: number;
  }) {
    super(payload.organizationId, AGG_TYPE, payload);
  }
}

export class OrganizationUpdatedEvent extends DomainEvent<{
  organizationId: string;
  updatedByUserId: number;
  changedFields: string[];
}> {
  constructor(payload: {
    organizationId: string;
    updatedByUserId: number;
    changedFields: string[];
  }) {
    super(payload.organizationId, AGG_TYPE, payload);
  }
}

export class OrganizationActivatedEvent extends DomainEvent<{
  organizationId: string;
  updatedByUserId: number;
}> {
  constructor(payload: { organizationId: string; updatedByUserId: number }) {
    super(payload.organizationId, AGG_TYPE, payload);
  }
}

export class OrganizationDeactivatedEvent extends DomainEvent<{
  organizationId: string;
  updatedByUserId: number;
}> {
  constructor(payload: { organizationId: string; updatedByUserId: number }) {
    super(payload.organizationId, AGG_TYPE, payload);
  }
}

export class OrganizationPrimarySetEvent extends DomainEvent<{
  organizationId: string;
  updatedByUserId: number;
}> {
  constructor(payload: { organizationId: string; updatedByUserId: number }) {
    super(payload.organizationId, AGG_TYPE, payload);
  }
}

export type OrganizationSettingsSection = 'regional' | 'fiscal' | 'notifications' | 'branding';

export class OrganizationSettingsUpdatedEvent extends DomainEvent<{
  organizationId: string;
  section: OrganizationSettingsSection;
  updatedByUserId: number;
}> {
  constructor(payload: {
    organizationId: string;
    section: OrganizationSettingsSection;
    updatedByUserId: number;
  }) {
    super(payload.organizationId, AGG_TYPE, payload);
  }
}
