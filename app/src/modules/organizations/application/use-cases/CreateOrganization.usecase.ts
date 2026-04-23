import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { Address } from '../../../../shared/domain/value-objects/Address.vo';
import { CountryCode } from '../../../../shared/domain/value-objects/CountryCode.vo';
import { Email } from '../../../../shared/domain/value-objects/Email.vo';
import { Phone } from '../../../../shared/domain/value-objects/Phone.vo';
import { TaxId } from '../../../../shared/domain/value-objects/TaxId.vo';
import { UserId } from '../../../../shared/domain/value-objects/UserId.vo';
import { OUTBOX_REPOSITORY } from '../../../../shared/domain/events/OutboxRepository.interface';
import type { OutboxRepository } from '../../../../shared/domain/events/OutboxRepository.interface';
import { OrganizationModuleService } from '../../../../shared/plugin-system/application/OrganizationModuleService';
import { ORGANIZATION_REPOSITORY, TAX_ID_POLICY_REGISTRY } from '../../Organizations.Tokens';
import type { OrganizationRepository } from '../../domain/repositories/OrganizationRepository.interface';
import type { TaxIdPolicyRegistry } from '../../domain/policies/TaxIdPolicy.interface';
import {
  OrganizationAddress,
  Organization,
  OrganizationSettings,
  RegionalSettings,
  FiscalSettings,
  NotificationSettings,
  BrandingSettings,
} from '../../domain/entities';
import {
  DuplicateOrganizationTaxIdException,
  InvalidOrganizationDataException,
} from '../../domain/exceptions';
import { CreateOrganizationCommand } from '../commands';
import { OrganizationResult, toOrganizationResult } from '../results/OrganizationResult';

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: OrganizationRepository,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
    @Inject(TAX_ID_POLICY_REGISTRY) private readonly taxIdRegistry: TaxIdPolicyRegistry,
    private readonly prisma: PrismaService,
    private readonly organizationModuleService: OrganizationModuleService,
  ) {}

  async execute(cmd: CreateOrganizationCommand, actorId: number): Promise<OrganizationResult> {
    // ===== Validaciones previas (fuera de TX) =====
    const countryCode = CountryCode.create(cmd.countryCode);
    const email = cmd.email ? Email.create(cmd.email) : null;
    const phone = cmd.phone ? Phone.create(cmd.phone) : null;

    let taxId: TaxId | null = null;
    if (cmd.taxId) {
      taxId = TaxId.create(cmd.taxId, countryCode);
      const policyResult = this.taxIdRegistry.resolve(countryCode.value).validate(taxId);
      if (policyResult.isFailure()) {
        throw new InvalidOrganizationDataException(policyResult.getError().message);
      }
      const dup = await this.repo.findByTaxId(taxId.value, countryCode.value);
      if (dup) throw new DuplicateOrganizationTaxIdException(taxId.value, countryCode.value);
    }

    // ===== Construir settings =====
    const s = cmd.settings ?? {};
    const settings = new OrganizationSettings(
      RegionalSettings.create({
        timezone: s.regional?.timezone ?? 'America/Santiago',
        locale: s.regional?.locale ?? 'es-CL',
        currency: s.regional?.currency ?? 'CLP',
        dateFormat: s.regional?.dateFormat,
        numberFormat: s.regional?.numberFormat,
        weekStart: s.regional?.weekStart,
        timeFormat: s.regional?.timeFormat,
      }),
      FiscalSettings.create({
        fiscalYearStartMonth: s.fiscal?.fiscalYearStartMonth,
        taxRegime: s.fiscal?.taxRegime,
        economicActivity: s.fiscal?.economicActivity,
        notes: s.fiscal?.notes,
      }),
      NotificationSettings.create({
        emailFromName: s.notifications?.emailFromName,
        emailReplyTo: s.notifications?.emailReplyTo,
        enableEmail: s.notifications?.enableEmail,
        smsEnabled: s.notifications?.smsEnabled,
      }),
      BrandingSettings.create({
        primaryColor: s.branding?.primaryColor,
        secondaryColor: s.branding?.secondaryColor,
        logoUrl: s.branding?.logoUrl,
        faviconUrl: s.branding?.faviconUrl,
      }),
    );

    const addresses = (cmd.addresses ?? []).map((a) =>
      OrganizationAddress.create({
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

    const actor = UserId.create(actorId);
    const org = Organization.create({
      legalName: cmd.legalName,
      tradeName: cmd.tradeName,
      taxId,
      countryCode,
      email,
      phone,
      website: cmd.website ?? null,
      isPrimary: cmd.isPrimary,
      addresses,
      settings,
      createdByUserId: actor,
    });

    // ===== Persistir + Outbox en misma TX =====
    await this.prisma.$transaction(async (tx) => {
      if (org.isPrimary) {
        await this.repo.clearPrimaryFlag(org.id, tx);
      }
      await this.repo.save(org, tx);
      await this.outbox.saveAll(org.pullDomainEvents(), tx);
    });

    // ===== Habilitar plugins por defecto (post-commit) =====
    // Fuera de la TX para no acoplar disponibilidad de módulos a la creación
    // de la organización. Si falla, se puede re-ejecutar manualmente.
    await this.organizationModuleService.enableDefaultsForNewOrganization(org.id.value);

    return toOrganizationResult(org);
  }
}
