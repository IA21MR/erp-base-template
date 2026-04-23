import { z } from 'zod';

const EmailSchema = z.object({
  id: z.string(),
  email: z.string(),
  label: z.string().nullable(),
  isPrimary: z.boolean(),
});
const PhoneSchema = z.object({
  id: z.string(),
  phone: z.string(),
  label: z.string().nullable(),
  isPrimary: z.boolean(),
});
const AddressSchema = z.object({
  id: z.string(),
  street: z.string(),
  city: z.string(),
  region: z.string().nullable(),
  postalCode: z.string().nullable(),
  countryCode: z.string(),
  label: z.string().nullable(),
  isPrimary: z.boolean(),
});
const RoleSchema = z.object({
  id: z.string(),
  roleTypeId: z.string(),
  since: z.string().nullable(),
  until: z.string().nullable(),
});

export const ContactApiResponseSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  type: z.enum(['PERSON', 'COMPANY']),
  displayName: z.string(),
  personFirstName: z.string().nullable(),
  personLastName: z.string().nullable(),
  companyLegalName: z.string().nullable(),
  companyTradeName: z.string().nullable(),
  taxId: z.string().nullable(),
  countryCode: z.string().nullable(),
  notes: z.string().nullable(),
  userId: z.number().nullable(),
  active: z.boolean(),
  assignedToUserId: z.number().nullable(),
  emails: z.array(EmailSchema),
  phones: z.array(PhoneSchema),
  addresses: z.array(AddressSchema),
  roles: z.array(RoleSchema),
  createdByUserId: z.number(),
  updatedByUserId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ContactListResponseSchema = z.object({
  data: z.array(ContactApiResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
    totalPages: z.number(),
  }),
});

export const ContactRoleTypeSchema = z.object({
  id: z.string(),
  code: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
});

export const ContactRoleTypeListResponseSchema = z.object({
  data: z.array(ContactRoleTypeSchema),
});
