import { Contact } from '../../domain/entities/Contact.entity';
import { ContactRoleType } from '../../domain/entities/ContactRoleType.entity';

export interface ContactResult {
  id: string;
  organizationId: string;
  type: 'PERSON' | 'COMPANY';
  displayName: string;
  personFirstName: string | null;
  personLastName: string | null;
  companyLegalName: string | null;
  companyTradeName: string | null;
  taxId: string | null;
  countryCode: string | null;
  notes: string | null;
  userId: number | null;
  active: boolean;
  assignedToUserId: number | null;
  emails: Array<{ id: string; email: string; label: string | null; isPrimary: boolean }>;
  phones: Array<{ id: string; phone: string; label: string | null; isPrimary: boolean }>;
  addresses: Array<{
    id: string;
    street: string;
    city: string;
    region: string | null;
    postalCode: string | null;
    countryCode: string;
    label: string | null;
    isPrimary: boolean;
  }>;
  roles: Array<{ id: string; roleTypeId: string; since: Date | null; until: Date | null }>;
  createdByUserId: number;
  updatedByUserId: number;
  createdAt: Date;
  updatedAt: Date;
}

export function toContactResult(c: Contact): ContactResult {
  return {
    id: c.id.value,
    organizationId: c.organizationId,
    type: c.type,
    displayName: c.displayName,
    personFirstName: c.personFirstName,
    personLastName: c.personLastName,
    companyLegalName: c.companyLegalName,
    companyTradeName: c.companyTradeName,
    taxId: c.taxId?.value ?? null,
    countryCode: c.countryCode?.value ?? null,
    notes: c.notes,
    userId: c.userId,
    active: c.active,
    assignedToUserId: c.assignedToUserId,
    emails: c.emails.map((e) => ({ id: e.id, email: e.email.value, label: e.label, isPrimary: e.isPrimary })),
    phones: c.phones.map((p) => ({ id: p.id, phone: p.phone.value, label: p.label, isPrimary: p.isPrimary })),
    addresses: c.addresses.map((a) => ({
      id: a.id,
      street: a.address.street,
      city: a.address.city,
      region: a.address.region,
      postalCode: a.address.postalCode,
      countryCode: a.address.countryCode.value,
      label: a.label,
      isPrimary: a.isPrimary,
    })),
    roles: c.roles.map((r) => ({ id: r.id, roleTypeId: r.roleTypeId, since: r.since, until: r.until })),
    createdByUserId: c.createdByUserId.value,
    updatedByUserId: c.updatedByUserId.value,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export interface ContactRoleTypeResult {
  id: string;
  code: string;
  label: string;
  isSystem: boolean;
}

export function toContactRoleTypeResult(r: ContactRoleType): ContactRoleTypeResult {
  return { id: r.id, code: r.code, label: r.label, isSystem: r.isSystem };
}
