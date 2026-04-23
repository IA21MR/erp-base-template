/**
 * PrismaOrganizationRepository
 *
 * Implementación del port `OrganizationRepository`. Persiste el aggregate completo
 * (root + addresses + 4 tablas de settings) como una unidad. Acepta transaction
 * handle opcional para componerse con el outbox en una misma `$transaction`.
 */
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { PrismaTransactionClient } from '../../../../shared/database/transaction-manager';
import { Organization } from '../../domain/entities/Organization.entity';
import { OrganizationId } from '../../domain/value-objects/OrganizationId.vo';
import {
  OrganizationListFilters,
  OrganizationRepository,
} from '../../domain/repositories/OrganizationRepository.interface';
import { OrganizationMapper } from '../mappers/OrganizationMapper';

type Tx = PrismaTransactionClient;

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private client(tx?: Tx): Tx {
    return (tx ?? this.prisma) as Tx;
  }

  private async loadById(id: string, tx?: Tx): Promise<Organization | null> {
    const c = this.client(tx);
    const organization = await c.organization.findUnique({ where: { id } });
    if (!organization) return null;
    const [addresses, regional, fiscal, notifications, branding] = await Promise.all([
      c.organizationAddress.findMany({ where: { organizationId: id } }),
      c.organizationRegionalSettings.findUnique({ where: { organizationId: id } }),
      c.organizationFiscalSettings.findUnique({ where: { organizationId: id } }),
      c.organizationNotificationSettings.findUnique({ where: { organizationId: id } }),
      c.organizationBrandingSettings.findUnique({ where: { organizationId: id } }),
    ]);
    return OrganizationMapper.toDomain({
      organization,
      addresses,
      regional,
      fiscal,
      notifications,
      branding,
    });
  }

  async findById(id: OrganizationId | string): Promise<Organization | null> {
    const raw = typeof id === 'string' ? id : id.value;
    return this.loadById(raw);
  }

  async findByTaxId(taxId: string, countryCode: string): Promise<Organization | null> {
    const row = await this.prisma.organization.findFirst({
      where: { taxId, countryCode },
      select: { id: true },
    });
    return row ? this.loadById(row.id) : null;
  }

  async findPrimary(): Promise<Organization | null> {
    const row = await this.prisma.organization.findFirst({
      where: { isPrimary: true },
      select: { id: true },
    });
    return row ? this.loadById(row.id) : null;
  }

  async list(
    filters: OrganizationListFilters,
    page: number,
    perPage: number,
  ): Promise<{ items: Organization[]; total: number }> {
    const where: Prisma.OrganizationWhereInput = {};
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.isPrimary !== undefined) where.isPrimary = filters.isPrimary;
    if (filters.countryCode) where.countryCode = filters.countryCode;
    if (filters.query) {
      const q = filters.query;
      where.OR = [
        { legalName: { contains: q, mode: 'insensitive' } },
        { tradeName: { contains: q, mode: 'insensitive' } },
        { taxId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        select: { id: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.organization.count({ where }),
    ]);

    const items = (await Promise.all(rows.map((r) => this.loadById(r.id)))).filter(
      (x): x is Organization => x !== null,
    );
    return { items, total };
  }

  async search(
    query: string,
    page: number,
    perPage: number,
  ): Promise<{ items: Organization[]; total: number }> {
    return this.list({ query }, page, perPage);
  }

  async save(org: Organization, tx?: Tx): Promise<void> {
    const c = this.client(tx);
    const id = org.id.value;

    const data = {
      id,
      legalName: org.legalName,
      tradeName: org.tradeName,
      taxId: org.taxId?.value ?? null,
      countryCode: org.countryCode.value,
      email: org.email?.value ?? null,
      phone: org.phone?.value ?? null,
      website: org.website,
      active: org.active,
      isPrimary: org.isPrimary,
      createdByUserId: org.createdByUserId.value,
      updatedByUserId: org.updatedByUserId.value,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };

    // Upsert root
    await c.organization.upsert({
      where: { id },
      create: data,
      update: {
        legalName: data.legalName,
        tradeName: data.tradeName,
        taxId: data.taxId,
        countryCode: data.countryCode,
        email: data.email,
        phone: data.phone,
        website: data.website,
        active: data.active,
        isPrimary: data.isPrimary,
        updatedByUserId: data.updatedByUserId,
        updatedAt: data.updatedAt,
      },
    });

    // Settings contenedor (tabla 1:1)
    await c.organizationSettings.upsert({
      where: { organizationId: id },
      create: { organizationId: id },
      update: {},
    });

    // Las 4 secciones
    const r = org.settings.regional;
    await c.organizationRegionalSettings.upsert({
      where: { organizationId: id },
      create: {
        organizationId: id,
        timezone: r.timezone.value,
        locale: r.locale.value,
        currency: r.currency.value,
        dateFormat: r.dateFormat,
        numberFormat: r.numberFormat,
        weekStart: r.weekStart,
        timeFormat: r.timeFormat,
      },
      update: {
        timezone: r.timezone.value,
        locale: r.locale.value,
        currency: r.currency.value,
        dateFormat: r.dateFormat,
        numberFormat: r.numberFormat,
        weekStart: r.weekStart,
        timeFormat: r.timeFormat,
      },
    });

    const f = org.settings.fiscal;
    await c.organizationFiscalSettings.upsert({
      where: { organizationId: id },
      create: {
        organizationId: id,
        fiscalYearStartMonth: f.fiscalYearStartMonth,
        taxRegime: f.taxRegime,
        economicActivity: f.economicActivity,
        notes: f.notes,
      },
      update: {
        fiscalYearStartMonth: f.fiscalYearStartMonth,
        taxRegime: f.taxRegime,
        economicActivity: f.economicActivity,
        notes: f.notes,
      },
    });

    const n = org.settings.notifications;
    await c.organizationNotificationSettings.upsert({
      where: { organizationId: id },
      create: {
        organizationId: id,
        emailFromName: n.emailFromName,
        emailReplyTo: n.emailReplyTo?.value ?? null,
        enableEmail: n.enableEmail,
        smsEnabled: n.smsEnabled,
      },
      update: {
        emailFromName: n.emailFromName,
        emailReplyTo: n.emailReplyTo?.value ?? null,
        enableEmail: n.enableEmail,
        smsEnabled: n.smsEnabled,
      },
    });

    const b = org.settings.branding;
    await c.organizationBrandingSettings.upsert({
      where: { organizationId: id },
      create: {
        organizationId: id,
        primaryColor: b.primaryColor,
        secondaryColor: b.secondaryColor,
        logoUrl: b.logoUrl,
        faviconUrl: b.faviconUrl,
      },
      update: {
        primaryColor: b.primaryColor,
        secondaryColor: b.secondaryColor,
        logoUrl: b.logoUrl,
        faviconUrl: b.faviconUrl,
      },
    });

    // Addresses: sync simple — borrar los que ya no están y upsert del resto.
    const existingIds = (
      await c.organizationAddress.findMany({
        where: { organizationId: id },
        select: { id: true },
      })
    ).map((a) => a.id);
    const currentIds = org.addresses.map((a) => a.id);
    const toDelete = existingIds.filter((eid) => !currentIds.includes(eid));
    if (toDelete.length > 0) {
      await c.organizationAddress.deleteMany({ where: { id: { in: toDelete } } });
    }
    for (const a of org.addresses) {
      await c.organizationAddress.upsert({
        where: { id: a.id },
        create: {
          id: a.id,
          organizationId: id,
          street: a.address.street,
          city: a.address.city,
          region: a.address.region,
          postalCode: a.address.postalCode,
          countryCode: a.address.countryCode.value,
          label: a.label,
          isPrimary: a.isPrimary,
        },
        update: {
          street: a.address.street,
          city: a.address.city,
          region: a.address.region,
          postalCode: a.address.postalCode,
          countryCode: a.address.countryCode.value,
          label: a.label,
          isPrimary: a.isPrimary,
        },
      });
    }
  }

  async clearPrimaryFlag(exceptId: OrganizationId | string, tx?: Tx): Promise<void> {
    const raw = typeof exceptId === 'string' ? exceptId : exceptId.value;
    const c = this.client(tx);
    await c.organization.updateMany({
      where: { id: { not: raw }, isPrimary: true },
      data: { isPrimary: false },
    });
  }
}
