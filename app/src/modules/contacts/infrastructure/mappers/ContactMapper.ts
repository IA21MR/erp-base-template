/**
 * ContactMapper — convierte filas Prisma (con eager load) al aggregate Contact.
 */
import {
  Contact as PrismaContact,
  ContactEmail as PrismaContactEmail,
  ContactPhone as PrismaContactPhone,
  ContactAddress as PrismaContactAddress,
  ContactRole as PrismaContactRole,
  ContactRoleType as PrismaContactRoleType,
} from '@prisma/client';
import { Address } from '../../../../shared/domain/value-objects/Address.vo';
import { CountryCode } from '../../../../shared/domain/value-objects/CountryCode.vo';
import { Email } from '../../../../shared/domain/value-objects/Email.vo';
import { Phone } from '../../../../shared/domain/value-objects/Phone.vo';
import { TaxId } from '../../../../shared/domain/value-objects/TaxId.vo';
import { UserId } from '../../../../shared/domain/value-objects/UserId.vo';
import {
  Contact,
  ContactAddress,
  ContactEmail,
  ContactPhone,
  ContactRole,
  ContactRoleType,
} from '../../domain/entities';
import { ContactId } from '../../domain/value-objects/ContactId.vo';

export interface ContactRowsBundle {
  contact: PrismaContact;
  emails: PrismaContactEmail[];
  phones: PrismaContactPhone[];
  addresses: PrismaContactAddress[];
  roles: PrismaContactRole[];
}

export class ContactMapper {
  static toDomain(b: ContactRowsBundle): Contact {
    const c = b.contact;
    const country = c.countryCode ? CountryCode.create(c.countryCode) : null;
    const taxId = c.taxId && country ? TaxId.create(c.taxId, country) : null;

    const emails = b.emails.map(
      (e) => new ContactEmail(e.id, Email.create(e.email), e.label, e.isPrimary),
    );
    const phones = b.phones.map(
      (p) => new ContactPhone(p.id, Phone.create(p.phone), p.label, p.isPrimary),
    );
    const addresses = b.addresses.map(
      (a) =>
        new ContactAddress(
          a.id,
          Address.create({
            street: a.street,
            city: a.city,
            region: a.region,
            postalCode: a.postalCode,
            countryCode: a.countryCode,
          }),
          a.label,
          a.isPrimary,
        ),
    );
    const roles = b.roles.map((r) => new ContactRole(r.id, r.roleTypeId, r.since, r.until));

    return Contact.hydrate({
      id: ContactId.create(c.id),
      organizationId: c.organizationId,
      type: c.type,
      personFirstName: c.personFirstName,
      personLastName: c.personLastName,
      companyLegalName: c.companyLegalName,
      companyTradeName: c.companyTradeName,
      taxId,
      countryCode: country,
      notes: c.notes,
      userId: c.userId,
      active: c.active,
      assignedToUserId: c.assignedToUserId,
      emails,
      phones,
      addresses,
      roles,
      createdByUserId: UserId.create(c.createdByUserId),
      updatedByUserId: UserId.create(c.updatedByUserId),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    });
  }

  static roleTypeToDomain(r: PrismaContactRoleType): ContactRoleType {
    return new ContactRoleType(r.id, r.code, r.label, r.isSystem);
  }
}
