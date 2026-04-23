/**
 * Validaciones del módulo Organizations
 */

import { z } from 'zod';

const hexColor = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export const organizationAddressSchema = z.object({
  id: z.string().optional(),
  label: z.string().max(60).optional().or(z.literal('')),
  street: z.string().min(1, 'La calle es requerida').max(200),
  street2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(120).optional().or(z.literal('')),
  state: z.string().max(120).optional().or(z.literal('')),
  postalCode: z.string().max(30).optional().or(z.literal('')),
  countryCode: z
    .string()
    .length(2, 'El código de país debe ser ISO-3166 (2 letras)')
    .regex(/^[A-Z]{2}$/, 'Debe ser 2 letras mayúsculas'),
  isPrimary: z.boolean().optional(),
});

export const organizationSchema = z.object({
  legalName: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  tradeName: z.string().max(200).optional().or(z.literal('')),
  taxId: z.string().min(2, 'Mínimo 2 caracteres').max(40),
  countryCode: z
    .string()
    .length(2, 'El código de país debe ser ISO-3166 (2 letras)')
    .regex(/^[A-Z]{2}$/, 'Debe ser 2 letras mayúsculas'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  addresses: z.array(organizationAddressSchema).optional(),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
export type OrganizationAddressFormData = z.infer<typeof organizationAddressSchema>;

export const regionalSettingsSchema = z.object({
  timezone: z.string().min(1).max(60),
  locale: z.string().min(2).max(20),
  currency: z.string().length(3, 'ISO-4217 (3 letras)').regex(/^[A-Z]{3}$/),
  weekStart: z.number().int().min(0).max(6),
  dateFormat: z.string().min(1).max(40),
  timeFormat: z.string().min(1).max(20),
});
export type RegionalSettingsFormData = z.infer<typeof regionalSettingsSchema>;

export const fiscalSettingsSchema = z.object({
  fiscalYearStartMonth: z.number().int().min(1).max(12),
  taxRegime: z.string().max(80).optional().or(z.literal('')),
  economicActivity: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});
export type FiscalSettingsFormData = z.infer<typeof fiscalSettingsSchema>;

export const notificationSettingsSchema = z.object({
  emailFrom: z.string().email('Email inválido').optional().or(z.literal('')),
  emailReplyTo: z.string().email('Email inválido').optional().or(z.literal('')),
  enableEmail: z.boolean(),
  enableSms: z.boolean(),
});
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

export const brandingSettingsSchema = z.object({
  primaryColor: z
    .string()
    .regex(hexColor, 'Color HEX inválido (#RRGGBB)')
    .optional()
    .or(z.literal('')),
  secondaryColor: z
    .string()
    .regex(hexColor, 'Color HEX inválido (#RRGGBB)')
    .optional()
    .or(z.literal('')),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  faviconUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});
export type BrandingSettingsFormData = z.infer<typeof brandingSettingsSchema>;
