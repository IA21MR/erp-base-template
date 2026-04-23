/**
 * OrganizationMapper — traduce entre Prisma rows y el aggregate `Organization`.
 */
import {
  Organization as PrismaOrganization,
  OrganizationAddress as PrismaOrgAddress,
  OrganizationRegionalSettings as PrismaRegional,
  OrganizationFiscalSettings as PrismaFiscal,
  OrganizationNotificationSettings as PrismaNotifications,
  OrganizationBrandingSettings as PrismaBranding,
} from '@prisma/client';
import { Address } from '../../../../shared/domain/value-objects/Address.vo';
import { CountryCode } from '../../../../shared/domain/value-objects/CountryCode.vo';
import { Email } from '../../../../shared/domain/value-objects/Email.vo';
import { Phone } from '../../../../shared/domain/value-objects/Phone.vo';
import { TaxId } from '../../../../shared/domain/value-objects/TaxId.vo';
import { UserId } from '../../../../shared/domain/value-objects/UserId.vo';
import { Organization } from '../../domain/entities/Organization.entity';
import { OrganizationAddress } from '../../domain/entities/OrganizationAddress.entity';
import { OrganizationSettings } from '../../domain/entities/OrganizationSettings.entity';
import { RegionalSettings } from '../../domain/entities/RegionalSettings.entity';
import { FiscalSettings } from '../../domain/entities/FiscalSettings.entity';
import { NotificationSettings } from '../../domain/entities/NotificationSettings.entity';
import { BrandingSettings } from '../../domain/entities/BrandingSettings.entity';
import { OrganizationId } from '../../domain/value-objects/OrganizationId.vo';

export interface OrganizationRowsBundle {
  organization: PrismaOrganization;
  addresses: PrismaOrgAddress[];
  regional: PrismaRegional | null;
  fiscal: PrismaFiscal | null;
  notifications: PrismaNotifications | null;
  branding: PrismaBranding | null;
}

export class OrganizationMapper {
  static toDomain(bundle: OrganizationRowsBundle): Organization {
    const o = bundle.organization;
    const countryCode = CountryCode.create(o.countryCode);

    const settings = new OrganizationSettings(
      bundle.regional
        ? RegionalSettings.create({
            timezone: bundle.regional.timezone,
            locale: bundle.regional.locale,
            currency: bundle.regional.currency,
            dateFormat: bundle.regional.dateFormat,
            numberFormat: bundle.regional.numberFormat,
            weekStart: bundle.regional.weekStart,
            timeFormat: bundle.regional.timeFormat,
          })
        : RegionalSettings.default(),
      bundle.fiscal
        ? FiscalSettings.create({
            fiscalYearStartMonth: bundle.fiscal.fiscalYearStartMonth,
            taxRegime: bundle.fiscal.taxRegime,
            economicActivity: bundle.fiscal.economicActivity,
            notes: bundle.fiscal.notes,
          })
        : FiscalSettings.default(),
      bundle.notifications
        ? NotificationSettings.create({
            emailFromName: bundle.notifications.emailFromName,
            emailReplyTo: bundle.notifications.emailReplyTo,
            enableEmail: bundle.notifications.enableEmail,
            smsEnabled: bundle.notifications.smsEnabled,
          })
        : NotificationSettings.default(),
      bundle.branding
        ? BrandingSettings.create({
            primaryColor: bundle.branding.primaryColor,
            secondaryColor: bundle.branding.secondaryColor,
            logoUrl: bundle.branding.logoUrl,
            faviconUrl: bundle.branding.faviconUrl,
          })
        : BrandingSettings.default(),
    );

    const addresses = bundle.addresses.map((a) =>
      new OrganizationAddress(
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

    return Organization.hydrate({
      id: OrganizationId.create(o.id),
      legalName: o.legalName,
      tradeName: o.tradeName,
      taxId: o.taxId ? TaxId.create(o.taxId, countryCode) : null,
      countryCode,
      email: o.email ? Email.create(o.email) : null,
      phone: o.phone ? Phone.create(o.phone) : null,
      website: o.website ?? null,
      active: o.active,
      isPrimary: o.isPrimary,
      addresses,
      settings,
      createdByUserId: UserId.create(o.createdByUserId),
      updatedByUserId: UserId.create(o.updatedByUserId),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    });
  }
}
