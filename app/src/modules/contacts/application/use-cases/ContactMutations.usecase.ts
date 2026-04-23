/**
 * Use cases agrupados de mutación del Contact aggregate.
 * Cada uno recarga el aggregate, aplica el cambio y persiste con outbox en la misma TX.
 */
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
  ContactAddress,
  ContactEmail,
  ContactPhone,
  ContactRole,
} from '../../domain/entities';
import {
  ContactNotFoundException,
  ContactRoleTypeNotFoundException,
  DuplicateContactTaxIdException,
} from '../../domain/exceptions';
import {
  AddContactAddressCommand,
  AddContactEmailCommand,
  AddContactPhoneCommand,
  AddContactRoleCommand,
  AssignContactCommand,
  RemoveContactAddressCommand,
  RemoveContactEmailCommand,
  RemoveContactPhoneCommand,
  RemoveContactRoleCommand,
  SetPrimaryContactAddressCommand,
  SetPrimaryContactEmailCommand,
  SetPrimaryContactPhoneCommand,
  UpdateContactAddressCommand,
  UpdateContactCommand,
  UpdateContactEmailCommand,
  UpdateContactPhoneCommand,
} from '../commands';
import { ContactResult, toContactResult } from '../results/ContactResult';

abstract class BaseMutationUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY) protected readonly repo: ContactRepository,
    @Inject(OUTBOX_REPOSITORY) protected readonly outbox: OutboxRepository,
    protected readonly prisma: PrismaService,
  ) {}

  protected async persist(
    id: string,
    mutate: (c: Awaited<ReturnType<ContactRepository['findById']>>) => void,
  ): Promise<ContactResult> {
    const contact = await this.repo.findById(id);
    if (!contact) throw new ContactNotFoundException(id);
    mutate(contact);

    await this.prisma.$transaction(async (tx) => {
      await this.repo.save(contact, tx);
      await this.outbox.saveAll(contact.pullDomainEvents(), tx);
    });
    return toContactResult(contact);
  }
}

@Injectable()
export class UpdateContactUseCase extends BaseMutationUseCase {
  async execute(cmd: UpdateContactCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.id, (contact) => {
      if (!contact) return;
      const countryCode = cmd.countryCode !== undefined
        ? cmd.countryCode ? CountryCode.create(cmd.countryCode) : null
        : undefined;
      const taxId = cmd.taxId !== undefined
        ? cmd.taxId && (countryCode ?? contact.countryCode)
          ? TaxId.create(cmd.taxId, (countryCode ?? contact.countryCode)!)
          : null
        : undefined;
      contact.update(
        {
          personFirstName: cmd.personFirstName,
          personLastName: cmd.personLastName,
          companyLegalName: cmd.companyLegalName,
          companyTradeName: cmd.companyTradeName,
          taxId,
          countryCode,
          notes: cmd.notes,
          userId: cmd.userId,
        },
        UserId.create(actorId),
      );
    });
  }
}

@Injectable()
export class ActivateContactUseCase extends BaseMutationUseCase {
  async execute(id: string, actorId: number): Promise<ContactResult> {
    return this.persist(id, (c) => c!.activate(UserId.create(actorId)));
  }
}

@Injectable()
export class DeactivateContactUseCase extends BaseMutationUseCase {
  async execute(id: string, actorId: number): Promise<ContactResult> {
    return this.persist(id, (c) => c!.deactivate(UserId.create(actorId)));
  }
}

@Injectable()
export class AssignContactUseCase extends BaseMutationUseCase {
  async execute(cmd: AssignContactCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) => c!.assignTo(cmd.assignedToUserId, UserId.create(actorId)));
  }
}

@Injectable()
export class AddContactRoleUseCase extends BaseMutationUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY) repo: ContactRepository,
    @Inject(OUTBOX_REPOSITORY) outbox: OutboxRepository,
    @Inject(CONTACT_ROLE_TYPE_REPOSITORY) private readonly roleTypeRepo: ContactRoleTypeRepository,
    prisma: PrismaService,
  ) {
    super(repo, outbox, prisma);
  }

  async execute(cmd: AddContactRoleCommand, actorId: number): Promise<ContactResult> {
    const rt = await this.roleTypeRepo.findById(cmd.roleTypeId);
    if (!rt) throw new ContactRoleTypeNotFoundException(cmd.roleTypeId);
    return this.persist(cmd.contactId, (c) =>
      c!.addRole(
        ContactRole.create({ roleTypeId: cmd.roleTypeId, since: cmd.since, until: cmd.until }),
        UserId.create(actorId),
      ),
    );
  }
}

@Injectable()
export class RemoveContactRoleUseCase extends BaseMutationUseCase {
  async execute(cmd: RemoveContactRoleCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) => c!.removeRole(cmd.roleId, UserId.create(actorId)));
  }
}

// ============ emails ============
@Injectable()
export class AddContactEmailUseCase extends BaseMutationUseCase {
  async execute(cmd: AddContactEmailCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) =>
      c!.addEmail(ContactEmail.create({ email: cmd.email, label: cmd.label, isPrimary: cmd.isPrimary }), UserId.create(actorId)),
    );
  }
}

@Injectable()
export class UpdateContactEmailUseCase extends BaseMutationUseCase {
  async execute(cmd: UpdateContactEmailCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) =>
      c!.updateEmail(cmd.emailId, { email: cmd.email, label: cmd.label }, UserId.create(actorId)),
    );
  }
}

@Injectable()
export class RemoveContactEmailUseCase extends BaseMutationUseCase {
  async execute(cmd: RemoveContactEmailCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) => c!.removeEmail(cmd.emailId, UserId.create(actorId)));
  }
}

@Injectable()
export class SetPrimaryContactEmailUseCase extends BaseMutationUseCase {
  async execute(cmd: SetPrimaryContactEmailCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) => c!.setPrimaryEmail(cmd.emailId, UserId.create(actorId)));
  }
}

// ============ phones ============
@Injectable()
export class AddContactPhoneUseCase extends BaseMutationUseCase {
  async execute(cmd: AddContactPhoneCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) =>
      c!.addPhone(ContactPhone.create({ phone: cmd.phone, label: cmd.label, isPrimary: cmd.isPrimary }), UserId.create(actorId)),
    );
  }
}

@Injectable()
export class UpdateContactPhoneUseCase extends BaseMutationUseCase {
  async execute(cmd: UpdateContactPhoneCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) =>
      c!.updatePhone(cmd.phoneId, { phone: cmd.phone, label: cmd.label }, UserId.create(actorId)),
    );
  }
}

@Injectable()
export class RemoveContactPhoneUseCase extends BaseMutationUseCase {
  async execute(cmd: RemoveContactPhoneCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) => c!.removePhone(cmd.phoneId, UserId.create(actorId)));
  }
}

@Injectable()
export class SetPrimaryContactPhoneUseCase extends BaseMutationUseCase {
  async execute(cmd: SetPrimaryContactPhoneCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) => c!.setPrimaryPhone(cmd.phoneId, UserId.create(actorId)));
  }
}

// ============ addresses ============
@Injectable()
export class AddContactAddressUseCase extends BaseMutationUseCase {
  async execute(cmd: AddContactAddressCommand, actorId: number): Promise<ContactResult> {
    const address = Address.create({
      street: cmd.street,
      city: cmd.city,
      region: cmd.region,
      postalCode: cmd.postalCode,
      countryCode: cmd.countryCode,
    });
    return this.persist(cmd.contactId, (c) =>
      c!.addAddress(
        ContactAddress.create({ address, label: cmd.label, isPrimary: cmd.isPrimary }),
        UserId.create(actorId),
      ),
    );
  }
}

@Injectable()
export class UpdateContactAddressUseCase extends BaseMutationUseCase {
  async execute(cmd: UpdateContactAddressCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) => {
      const existing = c!.addresses.find((a) => a.id === cmd.addressId);
      if (!existing) return; // será manejado por updateAddress throwing NotFound si patch.address vacío
      const newAddress =
        cmd.street !== undefined ||
        cmd.city !== undefined ||
        cmd.region !== undefined ||
        cmd.postalCode !== undefined ||
        cmd.countryCode !== undefined
          ? Address.create({
              street: cmd.street ?? existing.address.street,
              city: cmd.city ?? existing.address.city,
              region: cmd.region !== undefined ? cmd.region : existing.address.region,
              postalCode: cmd.postalCode !== undefined ? cmd.postalCode : existing.address.postalCode,
              countryCode: cmd.countryCode ?? existing.address.countryCode.value,
            })
          : undefined;
      c!.updateAddress(cmd.addressId, { address: newAddress, label: cmd.label }, UserId.create(actorId));
    });
  }
}

@Injectable()
export class RemoveContactAddressUseCase extends BaseMutationUseCase {
  async execute(cmd: RemoveContactAddressCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) => c!.removeAddress(cmd.addressId, UserId.create(actorId)));
  }
}

@Injectable()
export class SetPrimaryContactAddressUseCase extends BaseMutationUseCase {
  async execute(cmd: SetPrimaryContactAddressCommand, actorId: number): Promise<ContactResult> {
    return this.persist(cmd.contactId, (c) => c!.setPrimaryAddress(cmd.addressId, UserId.create(actorId)));
  }
}
// Suprimir warning de imports no usados si aparece
void DuplicateContactTaxIdException;
