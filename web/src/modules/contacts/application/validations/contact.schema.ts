/**
 * Validaciones del módulo Contacts
 */
import { z } from 'zod';

export const contactEmailSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Email inválido'),
  label: z.string().max(50).optional().or(z.literal('')),
  isPrimary: z.boolean().optional(),
});

export const contactPhoneSchema = z.object({
  id: z.string().optional(),
  phone: z.string().min(1, 'Teléfono requerido').max(20),
  label: z.string().max(50).optional().or(z.literal('')),
  isPrimary: z.boolean().optional(),
});

export const contactAddressSchema = z.object({
  id: z.string().optional(),
  street: z.string().min(1, 'Calle requerida').max(200),
  city: z.string().min(1, 'Ciudad requerida').max(100),
  region: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  countryCode: z
    .string()
    .length(2, 'ISO-3166 (2 letras)')
    .regex(/^[A-Z]{2}$/),
  label: z.string().max(50).optional().or(z.literal('')),
  isPrimary: z.boolean().optional(),
});

export const contactSchema = z
  .object({
    organizationId: z.string().uuid('ID de organización inválido'),
    type: z.enum(['PERSON', 'COMPANY']),
    personFirstName: z.string().max(100).optional().or(z.literal('')),
    personLastName: z.string().max(100).optional().or(z.literal('')),
    companyLegalName: z.string().max(150).optional().or(z.literal('')),
    companyTradeName: z.string().max(150).optional().or(z.literal('')),
    taxId: z.string().min(3).max(30).optional().or(z.literal('')),
    countryCode: z
      .string()
      .length(2, 'ISO-3166 (2 letras)')
      .regex(/^[A-Z]{2}$/)
      .optional()
      .or(z.literal('')),
    notes: z.string().max(2000).optional().or(z.literal('')),
    assignedToUserId: z.number().int().nullable().optional(),
    emails: z.array(contactEmailSchema).optional(),
    phones: z.array(contactPhoneSchema).optional(),
    addresses: z.array(contactAddressSchema).optional(),
    roleTypeIds: z.array(z.string().uuid()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'PERSON') {
      if (!data.personFirstName || data.personFirstName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['personFirstName'],
          message: 'Nombre requerido para persona',
        });
      }
    } else if (data.type === 'COMPANY') {
      if (!data.companyLegalName || data.companyLegalName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyLegalName'],
          message: 'Razón social requerida para empresa',
        });
      }
    }
    // Si hay taxId, countryCode es requerido
    if (data.taxId && data.taxId.trim() !== '' && (!data.countryCode || data.countryCode === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['countryCode'],
        message: 'País requerido si hay Tax ID',
      });
    }
  });

export type ContactFormData = z.infer<typeof contactSchema>;
export type ContactEmailFormData = z.infer<typeof contactEmailSchema>;
export type ContactPhoneFormData = z.infer<typeof contactPhoneSchema>;
export type ContactAddressFormData = z.infer<typeof contactAddressSchema>;
