/**
 * Repositorio HTTP del módulo Organizations
 */
import { httpClient } from '@/shared/infrastructure';
import type { Organization } from '../../domain/types';
import type {
  OrganizationFormData,
  RegionalSettingsFormData,
  FiscalSettingsFormData,
  NotificationSettingsFormData,
  BrandingSettingsFormData,
} from '../../application/validations/organization.schema';
import {
  OrganizationApiResponseSchema,
  OrganizationListResponseSchema,
  AvailableModulesResponseSchema,
  EnabledModulesResponseSchema,
  type AvailableModule,
} from '../schemas/organization.schemas';

function mapToDomain(raw: unknown): Organization {
  const parsed = OrganizationApiResponseSchema.parse(raw);
  return parsed as Organization;
}

export class OrganizationsHttpRepository {
  private readonly basePath = '/organizations';

  async search(params: {
    query?: string;
    active?: boolean;
    countryCode?: string;
    page?: number;
    perPage?: number;
  }): Promise<{
    items: Organization[];
    meta: { total: number; page: number; perPage: number; totalPages: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('query', params.query);
    if (params.active !== undefined) searchParams.set('active', String(params.active));
    if (params.countryCode) searchParams.set('countryCode', params.countryCode);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.perPage) searchParams.set('perPage', String(params.perPage));

    const query = searchParams.toString();
    const url = query ? `${this.basePath}?${query}` : this.basePath;
    const response = await httpClient.get(url);
    const parsed = OrganizationListResponseSchema.parse(response);
    return {
      items: parsed.data as Organization[],
      meta: parsed.meta,
    };
  }

  async getById(id: string): Promise<Organization> {
    const response = await httpClient.get(`${this.basePath}/${id}`);
    return mapToDomain((response as any).data);
  }

  async getPrimary(): Promise<Organization | null> {
    const response = await httpClient.get(`${this.basePath}/primary`);
    const raw = (response as any).data;
    return raw ? mapToDomain(raw) : null;
  }

  async create(data: OrganizationFormData): Promise<Organization> {
    const response = await httpClient.post(this.basePath, this.toPayload(data));
    return mapToDomain((response as any).data);
  }

  async update(id: string, data: OrganizationFormData): Promise<Organization> {
    const response = await httpClient.patch(`${this.basePath}/${id}`, this.toPayload(data));
    return mapToDomain((response as any).data);
  }

  async activate(id: string): Promise<void> {
    await httpClient.patch(`${this.basePath}/${id}/activate`, {});
  }

  async deactivate(id: string): Promise<void> {
    await httpClient.patch(`${this.basePath}/${id}/deactivate`, {});
  }

  async setPrimary(id: string): Promise<void> {
    await httpClient.patch(`${this.basePath}/${id}/set-primary`, {});
  }

  async updateRegionalSettings(id: string, data: RegionalSettingsFormData): Promise<Organization> {
    const response = await httpClient.patch(`${this.basePath}/${id}/settings/regional`, data);
    return mapToDomain((response as any).data);
  }

  async updateFiscalSettings(id: string, data: FiscalSettingsFormData): Promise<Organization> {
    const response = await httpClient.patch(
      `${this.basePath}/${id}/settings/fiscal`,
      this.nullifyEmpty(data),
    );
    return mapToDomain((response as any).data);
  }

  async updateNotificationSettings(
    id: string,
    data: NotificationSettingsFormData,
  ): Promise<Organization> {
    const response = await httpClient.patch(
      `${this.basePath}/${id}/settings/notifications`,
      this.nullifyEmpty(data),
    );
    return mapToDomain((response as any).data);
  }

  async updateBrandingSettings(id: string, data: BrandingSettingsFormData): Promise<Organization> {
    const response = await httpClient.patch(
      `${this.basePath}/${id}/settings/branding`,
      this.nullifyEmpty(data),
    );
    return mapToDomain((response as any).data);
  }

  async getAvailableModules(): Promise<AvailableModule[]> {
    const response = await httpClient.get(`${this.basePath}/available-modules`);
    const parsed = AvailableModulesResponseSchema.parse(response);
    return parsed.data;
  }

  async getEnabledModules(id: string): Promise<string[]> {
    const response = await httpClient.get(`${this.basePath}/${id}/modules`);
    const parsed = EnabledModulesResponseSchema.parse(response);
    return parsed.data;
  }

  async enableModule(id: string, moduleName: string): Promise<void> {
    await httpClient.put(`${this.basePath}/${id}/modules/${moduleName}`, {});
  }

  async disableModule(id: string, moduleName: string): Promise<void> {
    await httpClient.delete(`${this.basePath}/${id}/modules/${moduleName}`);
  }

  private toPayload(data: OrganizationFormData): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      legalName: data.legalName,
      taxId: data.taxId,
      countryCode: data.countryCode,
    };
    if (data.tradeName) payload.tradeName = data.tradeName;
    if (data.email) payload.email = data.email;
    if (data.phone) payload.phone = data.phone;
    if (data.website) payload.website = data.website;
    if (data.addresses && data.addresses.length > 0) {
      payload.addresses = data.addresses.map((a) => ({
        id: a.id,
        label: a.label || undefined,
        street: a.street,
        street2: a.street2 || undefined,
        city: a.city || undefined,
        state: a.state || undefined,
        postalCode: a.postalCode || undefined,
        countryCode: a.countryCode,
        isPrimary: a.isPrimary ?? false,
      }));
    }
    return payload;
  }

  private nullifyEmpty<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = v === '' ? null : v;
    }
    return out;
  }
}

export const organizationsRepository = new OrganizationsHttpRepository();
