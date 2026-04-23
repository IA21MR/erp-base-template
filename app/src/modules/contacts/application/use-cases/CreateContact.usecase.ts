import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { Address } from '../../../../shared/domain/value-objects/Address.vo';
import { CountryCode } from '../../../../shared/domain/value-objects/CountryCode.vo';
import { TaxId } from '../../../../shared/domain/value-objects/TaxId.vo';
import { UserId } from '../../../../shared/domain/value-objects/UserId.vo';
import { OUTBOX_REPOSITORY } from '../../../../shared/domain/events/OutboxRepository.interface';
import type { OutboxRepository } from '../../../../shared/domain/events/OutboxRepository.interface';
import { CONTACT_REPOSITORY, CONTACT_ROLE_TYPE_REPOSITORY } from '../../Contacts.Tokens';
import type { ContactRepository } from '../../domain/repositories/ContactRepository.interface';
import type { ContactRoleTypeRepository } from '../../domain/repositories/ContactRoleTypeRepository.interface';
import {
  Contact,
  ContactAddress,
  ContactEmail,
  ContactPhone,
  ContactRole,
} from '../../domain/entities';
import {
  ContactRoleTypeNotFoundException,
  DuplicateContactTaxIdException,
} from '../../domain/exceptions';
import { CreateContactCommand } from '../commands';
import { ContactResult, toContactResult } from '../results/ContactResult';

@Injectable()
export class CreateContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY) private readonly repo: ContactRepository,
    @Inject(CONTACT_ROLE_TYPE_REPOSITORY) private readonly roleTypeRepo: ContactRoleTypeRepository,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: CreateContactCommand, actorId: number): Promise<ContactResult> {
    const countryCode = cmd.countryCode ? CountryCode.create(cmd.countryCode) : null;
    const taxId = cmd.taxId && countryCode ? TaxId.create(cmd.taxId, countryCode) : null;

    if (taxId && countryCode) {
      const dup = await this.repo.findByTaxId(cmd.organizationId, countryCode.value, taxId.value);
      if (dup) throw new DuplicateContactTaxIdException(taxId.value, countryCode.value, cmd.organizationId);
    }

    // Validar role types existen
    const roleTypeIds = cmd.roleTypeIds ?? [];
    for (const rid of roleTypeIds) {
      const rt = await this.roleTypeRepo.findById(rid);
      if (!rt) throw new ContactRoleTypeNotFoundException(rid);
    }

    const emails = (cmd.emails ?? []).map((e) => ContactEmail.create(e));
    const phones = (cmd.phones ?? []).map((p) => ContactPhone.create(p));
    const addresses = (cmd.addresses ?? []).map((a) =>
      ContactAddress.create({
        address: Address.create({
          street: a.street,
          city: a.city,
          region: a.region,
          postalCode: a.postalCode,
          countryCode: a.countryCode,
        }),
        label: a.label,
        isPrimary: a.isPrimary,
      }),
    );
    const roles = roleTypeIds.map((rid) => ContactRole.create({ roleTypeId: rid }));

    const actor = UserId.create(actorId);
    const contact = Contact.create({
      organizationId: cmd.organizationId,
      type: cmd.type,
      person:
        cmd.type === 'PERSON'
          ? { personFirstName: cmd.personFirstName ?? '', personLastName: cmd.personLastName ?? '' }
          : undefined,
      company:
        cmd.type === 'COMPANY'
          ? { companyLegalName: cmd.companyLegalName ?? '', companyTradeName: cmd.companyTradeName }
          : undefined,
      taxId,
      countryCode,
      notes: cmd.notes,
      userId: cmd.userId,
      assignedToUserId: cmd.assignedToUserId,
      emails,
      phones,
      addresses,
      roles,
      createdByUserId: actor,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.repo.save(contact, tx);
      await this.outbox.saveAll(contact.pullDomainEvents(), tx);
    });

    return toContactResult(contact);
  }
}
