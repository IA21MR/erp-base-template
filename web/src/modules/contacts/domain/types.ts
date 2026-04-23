/**
 * Tipos del módulo Contacts
 */

export type ContactType = 'PERSON' | 'COMPANY';

export interface ContactEmail {
  id: string;
  email: string;
  label: string | null;
  isPrimary: boolean;
}

export interface ContactPhone {
  id: string;
  phone: string;
  label: string | null;
  isPrimary: boolean;
}

export interface ContactAddress {
  id: string;
  street: string;
  city: string;
  region: string | null;
  postalCode: string | null;
  countryCode: string;
  label: string | null;
  isPrimary: boolean;
}

export interface ContactRole {
  id: string;
  roleTypeId: string;
  since: string | null;
  until: string | null;
}

export interface Contact {
  id: string;
  organizationId: string;
  type: ContactType;
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
  emails: ContactEmail[];
  phones: ContactPhone[];
  addresses: ContactAddress[];
  roles: ContactRole[];
  createdByUserId: number;
  updatedByUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactRoleType {
  id: string;
  code: string;
  label: string;
  isSystem: boolean;
}

export interface ContactFilters {
  search: string;
  status: 'TODOS' | 'ACTIVOS' | 'INACTIVOS';
  type?: ContactType | null;
  organizationId?: string | null;
  roleTypeId?: string | null;
  assignedToUserId?: number | null;
}
