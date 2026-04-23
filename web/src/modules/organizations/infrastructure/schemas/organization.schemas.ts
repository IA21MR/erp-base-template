import { z } from 'zod';

const AddressSchema = z.object({
  id: z.string(),
  label: z.string().nullable(),
  street: z.string(),
  street2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  countryCode: z.string(),
  isPrimary: z.boolean(),
});

const RegionalSchema = z.object({
  timezone: z.string(),
  locale: z.string(),
  currency: z.string(),
  weekStart: z.number(),
  dateFormat: z.string(),
  timeFormat: z.string(),
});

const FiscalSchema = z.object({
  fiscalYearStartMonth: z.number(),
  taxRegime: z.string().nullable(),
  economicActivity: z.string().nullable(),
  notes: z.string().nullable(),
});

const NotificationsSchema = z.object({
  emailFrom: z.string().nullable(),
  emailReplyTo: z.string().nullable(),
  enableEmail: z.boolean(),
  enableSms: z.boolean(),
});

const BrandingSchema = z.object({
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  logoUrl: z.string().nullable(),
  faviconUrl: z.string().nullable(),
});

const SettingsSchema = z.object({
  regional: RegionalSchema,
  fiscal: FiscalSchema,
  notifications: NotificationsSchema,
  branding: BrandingSchema,
});

export const OrganizationApiResponseSchema = z.object({
  id: z.string(),
  legalName: z.string(),
  tradeName: z.string().nullable(),
  taxId: z.string().nullable(),
  countryCode: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  logoUrl: z.string().nullable(),
  active: z.boolean(),
  isPrimary: z.boolean(),
  addresses: z.array(AddressSchema),
  settings: SettingsSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const OrganizationListResponseSchema = z.object({
  data: z.array(OrganizationApiResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
    totalPages: z.number(),
  }),
});

export type OrganizationApiResponse = z.infer<typeof OrganizationApiResponseSchema>;

export const AvailableModuleSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  version: z.string().nullable(),
});

export const AvailableModulesResponseSchema = z.object({
  data: z.array(AvailableModuleSchema),
});

export const EnabledModulesResponseSchema = z.object({
  data: z.array(z.string()),
});

export type AvailableModule = z.infer<typeof AvailableModuleSchema>;
