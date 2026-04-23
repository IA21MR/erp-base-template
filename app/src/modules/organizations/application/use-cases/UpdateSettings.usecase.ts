import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { UserId } from '../../../../shared/domain/value-objects/UserId.vo';
import { OUTBOX_REPOSITORY } from '../../../../shared/domain/events/OutboxRepository.interface';
import type { OutboxRepository } from '../../../../shared/domain/events/OutboxRepository.interface';
import { ORGANIZATION_REPOSITORY } from '../../Organizations.Tokens';
import type { OrganizationRepository } from '../../domain/repositories/OrganizationRepository.interface';
import { OrganizationNotFoundException } from '../../domain/exceptions';
import {
  UpdateBrandingSettingsCommand,
  UpdateFiscalSettingsCommand,
  UpdateNotificationSettingsCommand,
  UpdateRegionalSettingsCommand,
} from '../commands';
import { OrganizationResult, toOrganizationResult } from '../results/OrganizationResult';

async function persistAggregate(
  prisma: PrismaService,
  repo: OrganizationRepository,
  outbox: OutboxRepository,
  org: Parameters<OrganizationRepository['save']>[0],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await repo.save(org, tx);
    await outbox.saveAll(org.pullDomainEvents(), tx);
  });
}

@Injectable()
export class UpdateRegionalSettingsUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: OrganizationRepository,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: UpdateRegionalSettingsCommand, actorId: number): Promise<OrganizationResult> {
    const org = await this.repo.findById(cmd.id);
    if (!org) throw new OrganizationNotFoundException(cmd.id);
    org.updateRegionalSettings(
      {
        timezone: cmd.timezone,
        locale: cmd.locale,
        currency: cmd.currency,
        dateFormat: cmd.dateFormat,
        numberFormat: cmd.numberFormat,
        weekStart: cmd.weekStart,
        timeFormat: cmd.timeFormat,
      },
      UserId.create(actorId),
    );
    await persistAggregate(this.prisma, this.repo, this.outbox, org);
    return toOrganizationResult(org);
  }
}

@Injectable()
export class UpdateFiscalSettingsUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: OrganizationRepository,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: UpdateFiscalSettingsCommand, actorId: number): Promise<OrganizationResult> {
    const org = await this.repo.findById(cmd.id);
    if (!org) throw new OrganizationNotFoundException(cmd.id);
    org.updateFiscalSettings(
      {
        fiscalYearStartMonth: cmd.fiscalYearStartMonth,
        taxRegime: cmd.taxRegime,
        economicActivity: cmd.economicActivity,
        notes: cmd.notes,
      },
      UserId.create(actorId),
    );
    await persistAggregate(this.prisma, this.repo, this.outbox, org);
    return toOrganizationResult(org);
  }
}

@Injectable()
export class UpdateNotificationSettingsUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: OrganizationRepository,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: UpdateNotificationSettingsCommand, actorId: number): Promise<OrganizationResult> {
    const org = await this.repo.findById(cmd.id);
    if (!org) throw new OrganizationNotFoundException(cmd.id);
    org.updateNotificationSettings(
      {
        emailFromName: cmd.emailFromName,
        emailReplyTo: cmd.emailReplyTo,
        enableEmail: cmd.enableEmail,
        smsEnabled: cmd.smsEnabled,
      },
      UserId.create(actorId),
    );
    await persistAggregate(this.prisma, this.repo, this.outbox, org);
    return toOrganizationResult(org);
  }
}

@Injectable()
export class UpdateBrandingSettingsUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: OrganizationRepository,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: UpdateBrandingSettingsCommand, actorId: number): Promise<OrganizationResult> {
    const org = await this.repo.findById(cmd.id);
    if (!org) throw new OrganizationNotFoundException(cmd.id);
    org.updateBrandingSettings(
      {
        primaryColor: cmd.primaryColor,
        secondaryColor: cmd.secondaryColor,
        logoUrl: cmd.logoUrl,
        faviconUrl: cmd.faviconUrl,
      },
      UserId.create(actorId),
    );
    await persistAggregate(this.prisma, this.repo, this.outbox, org);
    return toOrganizationResult(org);
  }
}
