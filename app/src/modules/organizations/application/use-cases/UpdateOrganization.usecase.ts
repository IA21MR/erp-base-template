import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { CountryCode } from '../../../../shared/domain/value-objects/CountryCode.vo';
import { Email } from '../../../../shared/domain/value-objects/Email.vo';
import { Phone } from '../../../../shared/domain/value-objects/Phone.vo';
import { TaxId } from '../../../../shared/domain/value-objects/TaxId.vo';
import { UserId } from '../../../../shared/domain/value-objects/UserId.vo';
import { OUTBOX_REPOSITORY } from '../../../../shared/domain/events/OutboxRepository.interface';
import type { OutboxRepository } from '../../../../shared/domain/events/OutboxRepository.interface';
import { ORGANIZATION_REPOSITORY, TAX_ID_POLICY_REGISTRY } from '../../Organizations.Tokens';
import type { OrganizationRepository } from '../../domain/repositories/OrganizationRepository.interface';
import type { TaxIdPolicyRegistry } from '../../domain/policies/TaxIdPolicy.interface';
import {
  DuplicateOrganizationTaxIdException,
  InvalidOrganizationDataException,
  OrganizationNotFoundException,
} from '../../domain/exceptions';
import { UpdateOrganizationCommand } from '../commands';
import { OrganizationResult, toOrganizationResult } from '../results/OrganizationResult';

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: OrganizationRepository,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
    @Inject(TAX_ID_POLICY_REGISTRY) private readonly taxIdRegistry: TaxIdPolicyRegistry,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: UpdateOrganizationCommand, actorId: number): Promise<OrganizationResult> {
    const org = await this.repo.findById(cmd.id);
    if (!org) throw new OrganizationNotFoundException(cmd.id);

    const countryCode = cmd.countryCode ? CountryCode.create(cmd.countryCode) : undefined;
    const targetCountry = countryCode ?? org.countryCode;

    let taxId: TaxId | null | undefined = undefined;
    if (cmd.taxId !== undefined) {
      if (cmd.taxId === null) {
        taxId = null;
      } else {
        taxId = TaxId.create(cmd.taxId, targetCountry);
        const res = this.taxIdRegistry.resolve(targetCountry.value).validate(taxId);
        if (res.isFailure()) {
          throw new InvalidOrganizationDataException(res.getError().message);
        }
        const existing = await this.repo.findByTaxId(taxId.value, targetCountry.value);
        if (existing && existing.id.value !== org.id.value) {
          throw new DuplicateOrganizationTaxIdException(taxId.value, targetCountry.value);
        }
      }
    }

    org.update(
      {
        legalName: cmd.legalName,
        tradeName: cmd.tradeName,
        taxId,
        countryCode,
        email: cmd.email === undefined ? undefined : cmd.email === null ? null : Email.create(cmd.email),
        phone: cmd.phone === undefined ? undefined : cmd.phone === null ? null : Phone.create(cmd.phone),
        website: cmd.website,
      },
      UserId.create(actorId),
    );

    await this.prisma.$transaction(async (tx) => {
      await this.repo.save(org, tx);
      await this.outbox.saveAll(org.pullDomainEvents(), tx);
    });

    return toOrganizationResult(org);
  }
}
