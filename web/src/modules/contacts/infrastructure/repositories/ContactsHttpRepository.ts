/**
 * Repositorio HTTP del módulo Contacts
 */
import { httpClient } from '@/shared/infrastructure';
import type {
  Contact,
  ContactRoleType,
  ContactAddress,
  ContactEmail,
  ContactPhone,
  ContactType,
} from '../../domain/types';
import type {
  ContactFormData,
  ContactEmailFormData,
  ContactPhoneFormData,
  ContactAddressFormData,
} from '../../application/validations/contact.schema';
import {
  ContactApiResponseSchema,
  ContactListResponseSchema,
  ContactRoleTypeListResponseSchema,
} from '../schemas/contact.schemas';

type ApiEnvelope = { data: unknown };

function toContact(raw: unknown): Contact {
  return ContactApiResponseSchema.parse(raw) as Contact;
}

export interface ContactSearchParams {
  query?: string;
  active?: boolean;
  type?: ContactType;
  organizationId?: string;
  roleTypeId?: string;
  assignedToUserId?: number;
  page?: number;
  perPage?: number;
}

export class ContactsHttpRepository {
  private readonly basePath = '/contacts';

  async list(params: ContactSearchParams): Promise<{
    items: Contact[];
    meta: { total: number; page: number; perPage: number; totalPages: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('query', params.query);
    if (params.active !== undefined) searchParams.set('active', String(params.active));
    if (params.type) searchParams.set('type', params.type);
    if (params.organizationId) searchParams.set('organizationId', params.organizationId);
    if (params.roleTypeId) searchParams.set('roleTypeId', params.roleTypeId);
    if (params.assignedToUserId)
      searchParams.set('assignedToUserId', String(params.assignedToUserId));
    if (params.page) searchParams.set('page', String(params.page));
    if (params.perPage) searchParams.set('perPage', String(params.perPage));

    const qs = searchParams.toString();
    const url = qs ? `${this.basePath}?${qs}` : this.basePath;
    const response = await httpClient.get<unknown>(url);
    const parsed = ContactListResponseSchema.parse(response);
    return { items: parsed.data as Contact[], meta: parsed.meta };
  }

  async getById(id: string): Promise<Contact> {
    const response = await httpClient.get<ApiEnvelope>(`${this.basePath}/${id}`);
    return toContact(response.data);
  }

  async create(data: ContactFormData): Promise<Contact> {
    const response = await httpClient.post<ApiEnvelope>(this.basePath, this.toCreatePayload(data));
    return toContact(response.data);
  }

  async update(id: string, data: ContactFormData): Promise<Contact> {
    const payload = this.toUpdatePayload(data);
    const response = await httpClient.patch<ApiEnvelope>(`${this.basePath}/${id}`, payload);
    return toContact(response.data);
  }

  async activate(id: string): Promise<void> {
    await httpClient.patch(`${this.basePath}/${id}/activate`, {});
  }
  async deactivate(id: string): Promise<void> {
    await httpClient.patch(`${this.basePath}/${id}/deactivate`, {});
  }
  async assign(id: string, assignedToUserId: number | null): Promise<Contact> {
    const response = await httpClient.patch<ApiEnvelope>(`${this.basePath}/${id}/assign`, {
      assignedToUserId,
    });
    return toContact(response.data);
  }

  // ====== role types catálogo ======
  async listRoleTypes(): Promise<ContactRoleType[]> {
    const response = await httpClient.get<unknown>('/contact-role-types');
    const parsed = ContactRoleTypeListResponseSchema.parse(response);
    return parsed.data;
  }

  // ====== roles ======
  async addRole(id: string, roleTypeId: string): Promise<Contact> {
    const response = await httpClient.post<ApiEnvelope>(`${this.basePath}/${id}/roles`, {
      roleTypeId,
    });
    return toContact(response.data);
  }
  async removeRole(id: string, roleId: string): Promise<Contact> {
    const response = await httpClient.delete<ApiEnvelope>(
      `${this.basePath}/${id}/roles/${roleId}`,
    );
    return toContact(response.data);
  }

  // ====== emails ======
  async addEmail(id: string, data: ContactEmailFormData): Promise<Contact> {
    const response = await httpClient.post<ApiEnvelope>(
      `${this.basePath}/${id}/emails`,
      this.cleanEmail(data),
    );
    return toContact(response.data);
  }
  async updateEmail(id: string, emailId: string, data: Partial<ContactEmail>): Promise<Contact> {
    const response = await httpClient.patch<ApiEnvelope>(
      `${this.basePath}/${id}/emails/${emailId}`,
      data,
    );
    return toContact(response.data);
  }
  async removeEmail(id: string, emailId: string): Promise<Contact> {
    const response = await httpClient.delete<ApiEnvelope>(
      `${this.basePath}/${id}/emails/${emailId}`,
    );
    return toContact(response.data);
  }
  async setPrimaryEmail(id: string, emailId: string): Promise<Contact> {
    const response = await httpClient.patch<ApiEnvelope>(
      `${this.basePath}/${id}/emails/${emailId}/primary`,
      {},
    );
    return toContact(response.data);
  }

  // ====== phones ======
  async addPhone(id: string, data: ContactPhoneFormData): Promise<Contact> {
    const response = await httpClient.post<ApiEnvelope>(
      `${this.basePath}/${id}/phones`,
      this.cleanPhone(data),
    );
    return toContact(response.data);
  }
  async updatePhone(id: string, phoneId: string, data: Partial<ContactPhone>): Promise<Contact> {
    const response = await httpClient.patch<ApiEnvelope>(
      `${this.basePath}/${id}/phones/${phoneId}`,
      data,
    );
    return toContact(response.data);
  }
  async removePhone(id: string, phoneId: string): Promise<Contact> {
    const response = await httpClient.delete<ApiEnvelope>(
      `${this.basePath}/${id}/phones/${phoneId}`,
    );
    return toContact(response.data);
  }
  async setPrimaryPhone(id: string, phoneId: string): Promise<Contact> {
    const response = await httpClient.patch<ApiEnvelope>(
      `${this.basePath}/${id}/phones/${phoneId}/primary`,
      {},
    );
    return toContact(response.data);
  }

  // ====== addresses ======
  async addAddress(id: string, data: ContactAddressFormData): Promise<Contact> {
    const response = await httpClient.post<ApiEnvelope>(
      `${this.basePath}/${id}/addresses`,
      this.cleanAddress(data),
    );
    return toContact(response.data);
  }
  async updateAddress(
    id: string,
    addressId: string,
    data: Partial<ContactAddress>,
  ): Promise<Contact> {
    const response = await httpClient.patch<ApiEnvelope>(
      `${this.basePath}/${id}/addresses/${addressId}`,
      data,
    );
    return toContact(response.data);
  }
  async removeAddress(id: string, addressId: string): Promise<Contact> {
    const response = await httpClient.delete<ApiEnvelope>(
      `${this.basePath}/${id}/addresses/${addressId}`,
    );
    return toContact(response.data);
  }
  async setPrimaryAddress(id: string, addressId: string): Promise<Contact> {
    const response = await httpClient.patch<ApiEnvelope>(
      `${this.basePath}/${id}/addresses/${addressId}/primary`,
      {},
    );
    return toContact(response.data);
  }

  // ====== helpers ======
  private toCreatePayload(data: ContactFormData): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      organizationId: data.organizationId,
      type: data.type,
    };
    if (data.type === 'PERSON') {
      payload.personFirstName = data.personFirstName || undefined;
      if (data.personLastName) payload.personLastName = data.personLastName;
    } else {
      payload.companyLegalName = data.companyLegalName || undefined;
      if (data.companyTradeName) payload.companyTradeName = data.companyTradeName;
    }
    if (data.taxId) payload.taxId = data.taxId;
    if (data.countryCode) payload.countryCode = data.countryCode;
    if (data.notes) payload.notes = data.notes;
    if (data.assignedToUserId) payload.assignedToUserId = data.assignedToUserId;
    if (data.emails?.length) payload.emails = data.emails.map((e) => this.cleanEmail(e));
    if (data.phones?.length) payload.phones = data.phones.map((p) => this.cleanPhone(p));
    if (data.addresses?.length)
      payload.addresses = data.addresses.map((a) => this.cleanAddress(a));
    if (data.roleTypeIds?.length) payload.roleTypeIds = data.roleTypeIds;
    return payload;
  }

  private toUpdatePayload(data: ContactFormData): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    if (data.type === 'PERSON') {
      if (data.personFirstName !== undefined)
        payload.personFirstName = data.personFirstName || undefined;
      if (data.personLastName !== undefined)
        payload.personLastName = data.personLastName || undefined;
    } else {
      if (data.companyLegalName !== undefined)
        payload.companyLegalName = data.companyLegalName || undefined;
      if (data.companyTradeName !== undefined)
        payload.companyTradeName = data.companyTradeName || undefined;
    }
    if (data.taxId !== undefined) payload.taxId = data.taxId || null;
    if (data.countryCode !== undefined) payload.countryCode = data.countryCode || null;
    if (data.notes !== undefined) payload.notes = data.notes || null;
    return payload;
  }

  private cleanEmail(e: ContactEmailFormData) {
    return {
      email: e.email,
      label: e.label || undefined,
      isPrimary: e.isPrimary ?? false,
    };
  }
  private cleanPhone(p: ContactPhoneFormData) {
    return {
      phone: p.phone,
      label: p.label || undefined,
      isPrimary: p.isPrimary ?? false,
    };
  }
  private cleanAddress(a: ContactAddressFormData) {
    return {
      street: a.street,
      city: a.city,
      region: a.region || undefined,
      postalCode: a.postalCode || undefined,
      countryCode: a.countryCode,
      label: a.label || undefined,
      isPrimary: a.isPrimary ?? false,
    };
  }
}

export const contactsRepository = new ContactsHttpRepository();
