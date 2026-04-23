import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { PrismaTransactionClient } from '../../../../shared/database/transaction-manager';
import { Contact } from '../../domain/entities/Contact.entity';
import { ContactId } from '../../domain/value-objects/ContactId.vo';
import {
  ContactListFilters,
  ContactRepository,
} from '../../domain/repositories/ContactRepository.interface';
import { ContactMapper } from '../mappers/ContactMapper';

type Tx = PrismaTransactionClient;

@Injectable()
export class PrismaContactRepository implements ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  private client(tx?: Tx): Tx {
    return (tx ?? this.prisma) as Tx;
  }

  private async loadById(id: string, tx?: Tx): Promise<Contact | null> {
    const c = this.client(tx);
    const contact = await c.contact.findUnique({ where: { id } });
    if (!contact) return null;
    const [emails, phones, addresses, roles] = await Promise.all([
      c.contactEmail.findMany({ where: { contactId: id } }),
      c.contactPhone.findMany({ where: { contactId: id } }),
      c.contactAddress.findMany({ where: { contactId: id } }),
      c.contactRole.findMany({ where: { contactId: id } }),
    ]);
    return ContactMapper.toDomain({ contact, emails, phones, addresses, roles });
  }

  async findById(id: ContactId | string): Promise<Contact | null> {
    return this.loadById(typeof id === 'string' ? id : id.value);
  }

  async findByTaxId(organizationId: string, countryCode: string, taxId: string): Promise<Contact | null> {
    const row = await this.prisma.contact.findFirst({
      where: { organizationId, countryCode, taxId },
      select: { id: true },
    });
    return row ? this.loadById(row.id) : null;
  }

  async list(
    filters: ContactListFilters,
    page: number,
    perPage: number,
  ): Promise<{ items: Contact[]; total: number }> {
    const where: Prisma.ContactWhereInput = {};
    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.type) where.type = filters.type;
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.assignedToUserId !== undefined) where.assignedToUserId = filters.assignedToUserId;
    if (filters.roleTypeId) where.roles = { some: { roleTypeId: filters.roleTypeId } };
    if (filters.query) {
      const q = filters.query;
      where.OR = [
        { personFirstName: { contains: q, mode: 'insensitive' } },
        { personLastName: { contains: q, mode: 'insensitive' } },
        { companyLegalName: { contains: q, mode: 'insensitive' } },
        { companyTradeName: { contains: q, mode: 'insensitive' } },
        { taxId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        select: { id: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.contact.count({ where }),
    ]);

    const items = (await Promise.all(rows.map((r) => this.loadById(r.id)))).filter(
      (x): x is Contact => x !== null,
    );
    return { items, total };
  }

  async search(query: string, page: number, perPage: number) {
    return this.list({ query }, page, perPage);
  }

  async save(contact: Contact, tx?: Tx): Promise<void> {
    const c = this.client(tx);
    const id = contact.id.value;

    const data = {
      id,
      organizationId: contact.organizationId,
      type: contact.type,
      personFirstName: contact.personFirstName,
      personLastName: contact.personLastName,
      companyLegalName: contact.companyLegalName,
      companyTradeName: contact.companyTradeName,
      taxId: contact.taxId?.value ?? null,
      countryCode: contact.countryCode?.value ?? null,
      notes: contact.notes,
      userId: contact.userId,
      active: contact.active,
      assignedToUserId: contact.assignedToUserId,
      createdByUserId: contact.createdByUserId.value,
      updatedByUserId: contact.updatedByUserId.value,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };

    await c.contact.upsert({
      where: { id },
      create: data,
      update: {
        personFirstName: data.personFirstName,
        personLastName: data.personLastName,
        companyLegalName: data.companyLegalName,
        companyTradeName: data.companyTradeName,
        taxId: data.taxId,
        countryCode: data.countryCode,
        notes: data.notes,
        userId: data.userId,
        active: data.active,
        assignedToUserId: data.assignedToUserId,
        updatedByUserId: data.updatedByUserId,
        updatedAt: data.updatedAt,
      },
    });

    // Sync de sub-colecciones: borrar los que ya no están y upsert del resto.
    await this.syncEmails(c, id, contact);
    await this.syncPhones(c, id, contact);
    await this.syncAddresses(c, id, contact);
    await this.syncRoles(c, id, contact);
  }

  private async syncEmails(c: Tx, id: string, contact: Contact): Promise<void> {
    const existing = (await c.contactEmail.findMany({ where: { contactId: id }, select: { id: true } })).map((e) => e.id);
    const current = contact.emails.map((e) => e.id);
    const toDel = existing.filter((x) => !current.includes(x));
    if (toDel.length) await c.contactEmail.deleteMany({ where: { id: { in: toDel } } });
    for (const e of contact.emails) {
      await c.contactEmail.upsert({
        where: { id: e.id },
        create: {
          id: e.id,
          contactId: id,
          email: e.email.value,
          label: e.label,
          isPrimary: e.isPrimary,
        },
        update: { email: e.email.value, label: e.label, isPrimary: e.isPrimary },
      });
    }
  }

  private async syncPhones(c: Tx, id: string, contact: Contact): Promise<void> {
    const existing = (await c.contactPhone.findMany({ where: { contactId: id }, select: { id: true } })).map((p) => p.id);
    const current = contact.phones.map((p) => p.id);
    const toDel = existing.filter((x) => !current.includes(x));
    if (toDel.length) await c.contactPhone.deleteMany({ where: { id: { in: toDel } } });
    for (const p of contact.phones) {
      await c.contactPhone.upsert({
        where: { id: p.id },
        create: {
          id: p.id,
          contactId: id,
          phone: p.phone.value,
          label: p.label,
          isPrimary: p.isPrimary,
        },
        update: { phone: p.phone.value, label: p.label, isPrimary: p.isPrimary },
      });
    }
  }

  private async syncAddresses(c: Tx, id: string, contact: Contact): Promise<void> {
    const existing = (await c.contactAddress.findMany({ where: { contactId: id }, select: { id: true } })).map((a) => a.id);
    const current = contact.addresses.map((a) => a.id);
    const toDel = existing.filter((x) => !current.includes(x));
    if (toDel.length) await c.contactAddress.deleteMany({ where: { id: { in: toDel } } });
    for (const a of contact.addresses) {
      await c.contactAddress.upsert({
        where: { id: a.id },
        create: {
          id: a.id,
          contactId: id,
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

  private async syncRoles(c: Tx, id: string, contact: Contact): Promise<void> {
    const existing = (await c.contactRole.findMany({ where: { contactId: id }, select: { id: true } })).map((r) => r.id);
    const current = contact.roles.map((r) => r.id);
    const toDel = existing.filter((x) => !current.includes(x));
    if (toDel.length) await c.contactRole.deleteMany({ where: { id: { in: toDel } } });
    for (const r of contact.roles) {
      await c.contactRole.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          contactId: id,
          roleTypeId: r.roleTypeId,
          since: r.since,
          until: r.until,
        },
        update: { since: r.since, until: r.until },
      });
    }
  }
}
