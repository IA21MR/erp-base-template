/**
 * Results de salida del módulo Organizations (DTOs internos para use cases).
 * Los controllers los mapean a la forma HTTP de respuesta.
 */
import { Organization } from '../../domain/entities/Organization.entity';

export interface OrganizationResult {
  id: string;
  legalName: string;
  tradeName: string | null;
  taxId: string | null;
  countryCode: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  active: boolean;
  isPrimary: boolean;
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
  settings: {
    regional: {
      timezone: string;
      locale: string;
      currency: string;
      dateFormat: string;
      numberFormat: string;
      weekStart: number;
      timeFormat: string;
    };
    fiscal: {
      fiscalYearStartMonth: number;
      taxRegime: string | null;
      economicActivity: string | null;
      notes: string | null;
    };
    notifications: {
      emailFrom: string | null;
      emailReplyTo: string | null;
      enableEmail: boolean;
      enableSms: boolean;
    };
    branding: {
      primaryColor: string | null;
      secondaryColor: string | null;
      logoUrl: string | null;
      faviconUrl: string | null;
    };
  };
  createdByUserId: number;
  updatedByUserId: number;
  createdAt: Date;
  updatedAt: Date;
}

export function toOrganizationResult(org: Organization): OrganizationResult {
  return {
    id: org.id.value,
    legalName: org.legalName,
    tradeName: org.tradeName,
    taxId: org.taxId?.value ?? null,
    countryCode: org.countryCode.value,
    email: org.email?.value ?? null,
    phone: org.phone?.value ?? null,
    website: org.website,
    logoUrl: org.settings.branding.logoUrl,
    active: org.active,
    isPrimary: org.isPrimary,
    addresses: org.addresses.map((a) => ({
      id: a.id,
      street: a.address.street,
      city: a.address.city,
      region: a.address.region,
      postalCode: a.address.postalCode,
      countryCode: a.address.countryCode.value,
      label: a.label,
      isPrimary: a.isPrimary,
    })),
    settings: {
      regional: {
        timezone: org.settings.regional.timezone.value,
        locale: org.settings.regional.locale.value,
        currency: org.settings.regional.currency.value,
        dateFormat: org.settings.regional.dateFormat,
        numberFormat: org.settings.regional.numberFormat,
        weekStart: org.settings.regional.weekStart,
        timeFormat: org.settings.regional.timeFormat,
      },
      fiscal: {
        fiscalYearStartMonth: org.settings.fiscal.fiscalYearStartMonth,
        taxRegime: org.settings.fiscal.taxRegime,
        economicActivity: org.settings.fiscal.economicActivity,
        notes: org.settings.fiscal.notes,
      },
      notifications: {
        emailFrom: org.settings.notifications.emailFromName,
        emailReplyTo: org.settings.notifications.emailReplyTo?.value ?? null,
        enableEmail: org.settings.notifications.enableEmail,
        enableSms: org.settings.notifications.smsEnabled,
      },
      branding: {
        primaryColor: org.settings.branding.primaryColor,
        secondaryColor: org.settings.branding.secondaryColor,
        logoUrl: org.settings.branding.logoUrl,
        faviconUrl: org.settings.branding.faviconUrl,
      },
    },
    createdByUserId: org.createdByUserId.value,
    updatedByUserId: org.updatedByUserId.value,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}
