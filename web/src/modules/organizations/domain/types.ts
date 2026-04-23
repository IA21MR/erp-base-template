/**
 * Tipos del módulo Organizations
 */

export interface OrganizationAddress {
  id: string;
  label: string | null;
  street: string;
  street2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  countryCode: string;
  isPrimary: boolean;
}

export interface OrganizationRegionalSettings {
  timezone: string;
  locale: string;
  currency: string;
  weekStart: number;
  dateFormat: string;
  timeFormat: string;
}

export interface OrganizationFiscalSettings {
  fiscalYearStartMonth: number;
  taxRegime: string | null;
  economicActivity: string | null;
  notes: string | null;
}

export interface OrganizationNotificationSettings {
  emailFrom: string | null;
  emailReplyTo: string | null;
  enableEmail: boolean;
  enableSms: boolean;
}

export interface OrganizationBrandingSettings {
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
}

export interface OrganizationSettings {
  regional: OrganizationRegionalSettings;
  fiscal: OrganizationFiscalSettings;
  notifications: OrganizationNotificationSettings;
  branding: OrganizationBrandingSettings;
}

export interface Organization {
  id: string;
  legalName: string;
  tradeName: string | null;
  taxId: string;
  countryCode: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  active: boolean;
  isPrimary: boolean;
  addresses: OrganizationAddress[];
  settings: OrganizationSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationFilters {
  search: string;
  status: 'TODOS' | 'ACTIVOS' | 'INACTIVOS';
  countryCode?: string | null;
}
