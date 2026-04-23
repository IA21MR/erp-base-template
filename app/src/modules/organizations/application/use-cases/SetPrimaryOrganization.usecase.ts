import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { UserId } from '../../../../shared/domain/value-objects/UserId.vo';
import { OUTBOX_REPOSITORY } from '../../../../shared/domain/events/OutboxRepository.interface';
import type { OutboxRepository } from '../../../../shared/domain/events/OutboxRepository.interface';
import { ORGANIZATION_REPOSITORY } from '../../Organizations.Tokens';
import type { OrganizationRepository } from '../../domain/repositories/OrganizationRepository.interface';
import { OrganizationNotFoundException } from '../../domain/exceptions';
import { OrganizationResult, toOrganizationResult } from '../results/OrganizationResult';

/**
 * Marca una organización como primaria y desmarca todas las demás en la misma TX.
 */
@Injectable()
export class SetPrimaryOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: OrganizationRepository,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, actorId: number): Promise<OrganizationResult> {
    const org = await this.repo.findById(id);
    if (!org) throw new OrganizationNotFoundException(id);

    org.markAsPrimary(UserId.create(actorId));

    await this.prisma.$transaction(async (tx) => {
      await this.repo.clearPrimaryFlag(org.id, tx);
      await this.repo.save(org, tx);
      await this.outbox.saveAll(org.pullDomainEvents(), tx);
    });

    return toOrganizationResult(org);
  }
}
