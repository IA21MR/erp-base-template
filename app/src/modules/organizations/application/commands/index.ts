export interface AddressInput {
  street: string;
  city: string;
  region?: string | null;
  postalCode?: string | null;
  countryCode: string;
  label?: string | null;
  isPrimary?: boolean;
}

export interface CreateOrganizationCommand {
  legalName: string;
  tradeName?: string | null;
  taxId?: string | null;
  countryCode: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  isPrimary?: boolean;
  addresses?: AddressInput[];
  settings?: {
    regional?: {
      timezone?: string;
      locale?: string;
      currency?: string;
      dateFormat?: string;
      numberFormat?: string;
      weekStart?: number;
      timeFormat?: string;
    };
    fiscal?: {
      fiscalYearStartMonth?: number;
      taxRegime?: string | null;
      economicActivity?: string | null;
      notes?: string | null;
    };
    notifications?: {
      emailFromName?: string | null;
      emailReplyTo?: string | null;
      enableEmail?: boolean;
      smsEnabled?: boolean;
    };
    branding?: {
      primaryColor?: string | null;
      secondaryColor?: string | null;
      logoUrl?: string | null;
      faviconUrl?: string | null;
    };
  };
}

export interface UpdateOrganizationCommand {
  id: string;
  legalName?: string;
  tradeName?: string | null;
  taxId?: string | null;
  countryCode?: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

export interface UpdateRegionalSettingsCommand {
  id: string;
  timezone?: string;
  locale?: string;
  currency?: string;
  dateFormat?: string;
  numberFormat?: string;
  weekStart?: number;
  timeFormat?: string;
}

export interface UpdateFiscalSettingsCommand {
  id: string;
  fiscalYearStartMonth?: number;
  taxRegime?: string | null;
  economicActivity?: string | null;
  notes?: string | null;
}

export interface UpdateNotificationSettingsCommand {
  id: string;
  emailFromName?: string | null;
  emailReplyTo?: string | null;
  enableEmail?: boolean;
  smsEnabled?: boolean;
}

export interface UpdateBrandingSettingsCommand {
  id: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}

export interface ListOrganizationsCommand {
  page?: number;
  perPage?: number;
  active?: boolean;
  isPrimary?: boolean;
  countryCode?: string;
  query?: string;
}

export interface SearchOrganizationsCommand {
  query: string;
  page?: number;
  perPage?: number;
}
