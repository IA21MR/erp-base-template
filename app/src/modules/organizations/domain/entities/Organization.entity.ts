/**
 * Aggregate Root: Organization
 *
 * Entidad raíz del módulo CORE. Contiene settings (4 secciones) y direcciones
 * como entities hijas del mismo aggregate. Emite Domain Events para el outbox.
 */
import { uuidv7 } from 'uuidv7';
import { AggregateRoot } from '../../../../shared/domain/AggregateRoot';
import { CountryCode } from '../../../../shared/domain/value-objects/CountryCode.vo';
import { Email } from '../../../../shared/domain/value-objects/Email.vo';
import { Phone } from '../../../../shared/domain/value-objects/Phone.vo';
import { TaxId } from '../../../../shared/domain/value-objects/TaxId.vo';
import { UserId } from '../../../../shared/domain/value-objects/UserId.vo';
import { OrganizationId } from '../value-objects/OrganizationId.vo';
import { OrganizationAddress } from './OrganizationAddress.entity';
import { OrganizationSettings } from './OrganizationSettings.entity';
import {
  InvalidOrganizationDataException,
  OrganizationAlreadyActiveException,
  OrganizationAlreadyInactiveException,
  PrimaryOrganizationDeactivationForbiddenException,
} from '../exceptions';
import {
  OrganizationActivatedEvent,
  OrganizationCreatedEvent,
  OrganizationDeactivatedEvent,
  OrganizationPrimarySetEvent,
  OrganizationSettingsUpdatedEvent,
  OrganizationUpdatedEvent,
} from '../events';
import { RegionalSettings } from './RegionalSettings.entity';
import { FiscalSettings } from './FiscalSettings.entity';
import { NotificationSettings } from './NotificationSettings.entity';
import { BrandingSettings } from './BrandingSettings.entity';

export interface OrganizationAuditProps {
  createdByUserId: UserId;
  updatedByUserId: UserId;
  createdAt: Date;
  updatedAt: Date;
}

export class Organization extends AggregateRoot {
  private _legalName: string;
  private _tradeName: string | null;
  private _taxId: TaxId | null;
  private _countryCode: CountryCode;
  private _email: Email | null;
  private _phone: Phone | null;
  private _website: string | null;
  private _active: boolean;
  private _isPrimary: boolean;
  private _addresses: OrganizationAddress[];
  private _settings: OrganizationSettings;
  private _updatedByUserId: UserId;
  private _updatedAt: Date;

  private constructor(
    public readonly id: OrganizationId,
    legalName: string,
    tradeName: string | null,
    taxId: TaxId | null,
    countryCode: CountryCode,
    email: Email | null,
    phone: Phone | null,
    active: boolean,
    isPrimary: boolean,
    addresses: OrganizationAddress[],
    settings: OrganizationSettings,
    public readonly createdByUserId: UserId,
    updatedByUserId: UserId,
    public readonly createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    Organization.validateLegalName(legalName);
    this._legalName = legalName.trim();
    this._tradeName = tradeName?.trim() || null;
    this._taxId = taxId;
    this._countryCode = countryCode;
    this._email = email;
    this._phone = phone;
    this._website = null;
    this._active = active;
    this._isPrimary = isPrimary;
    this._addresses = addresses;
    this._settings = settings;
    this._updatedByUserId = updatedByUserId;
    this._updatedAt = updatedAt;
  }

  // ===== Factory ===================================================

  static create(props: {
    id?: OrganizationId;
    legalName: string;
    tradeName?: string | null;
    taxId?: TaxId | null;
    countryCode: CountryCode;
    email?: Email | null;
    phone?: Phone | null;
    website?: string | null;
    active?: boolean;
    isPrimary?: boolean;
    addresses?: OrganizationAddress[];
    settings?: OrganizationSettings;
    createdByUserId: UserId;
  }): Organization {
    const id = props.id ?? OrganizationId.generate();
    const now = new Date();
    const settings = props.settings ?? OrganizationSettings.default();
    const addresses = props.addresses ?? [];
    Organization.normalizePrimaryAddress(addresses);

    const org = new Organization(
      id,
      props.legalName,
      props.tradeName ?? null,
      props.taxId ?? null,
      props.countryCode,
      props.email ?? null,
      props.phone ?? null,
      props.active ?? true,
      props.isPrimary ?? false,
      addresses,
      settings,
      props.createdByUserId,
      props.createdByUserId,
      now,
      now,
    );
    org._website = props.website?.trim() || null;

    org.addDomainEvent(
      new OrganizationCreatedEvent({
        organizationId: id.value,
        legalName: org._legalName,
        countryCode: org._countryCode.value,
        isPrimary: org._isPrimary,
        createdByUserId: org.createdByUserId.value,
      }),
    );

    return org;
  }

  /** Hidratación desde persistencia (sin emitir eventos). */
  static hydrate(props: {
    id: OrganizationId;
    legalName: string;
    tradeName: string | null;
    taxId: TaxId | null;
    countryCode: CountryCode;
    email: Email | null;
    phone: Phone | null;
    website: string | null;
    active: boolean;
    isPrimary: boolean;
    addresses: OrganizationAddress[];
    settings: OrganizationSettings;
    createdByUserId: UserId;
    updatedByUserId: UserId;
    createdAt: Date;
    updatedAt: Date;
  }): Organization {
    const org = new Organization(
      props.id,
      props.legalName,
      props.tradeName,
      props.taxId,
      props.countryCode,
      props.email,
      props.phone,
      props.active,
      props.isPrimary,
      props.addresses,
      props.settings,
      props.createdByUserId,
      props.updatedByUserId,
      props.createdAt,
      props.updatedAt,
    );
    org._website = props.website;
    return org;
  }

  // ===== Getters ===================================================

  get legalName(): string { return this._legalName; }
  get tradeName(): string | null { return this._tradeName; }
  get taxId(): TaxId | null { return this._taxId; }
  get countryCode(): CountryCode { return this._countryCode; }
  get email(): Email | null { return this._email; }
  get phone(): Phone | null { return this._phone; }
  get website(): string | null { return this._website; }
  get active(): boolean { return this._active; }
  get isPrimary(): boolean { return this._isPrimary; }
  get addresses(): ReadonlyArray<OrganizationAddress> { return this._addresses; }
  get settings(): OrganizationSettings { return this._settings; }
  get updatedByUserId(): UserId { return this._updatedByUserId; }
  get updatedAt(): Date { return this._updatedAt; }

  // ===== Mutaciones ================================================

  /** Actualiza datos legales/comerciales. Sólo los campos provistos. */
  update(
    props: {
      legalName?: string;
      tradeName?: string | null;
      taxId?: TaxId | null;
      countryCode?: CountryCode;
      email?: Email | null;
      phone?: Phone | null;
      website?: string | null;
    },
    updatedBy: UserId,
  ): void {
    const changed: string[] = [];

    if (props.legalName !== undefined && props.legalName !== this._legalName) {
      Organization.validateLegalName(props.legalName);
      this._legalName = props.legalName.trim();
      changed.push('legalName');
    }
    if (props.tradeName !== undefined && (props.tradeName ?? null) !== this._tradeName) {
      this._tradeName = props.tradeName?.trim() || null;
      changed.push('tradeName');
    }
    if (props.taxId !== undefined) {
      this._taxId = props.taxId;
      changed.push('taxId');
    }
    if (props.countryCode !== undefined && !props.countryCode.equals(this._countryCode)) {
      this._countryCode = props.countryCode;
      changed.push('countryCode');
    }
    if (props.email !== undefined) {
      this._email = props.email;
      changed.push('email');
    }
    if (props.phone !== undefined) {
      this._phone = props.phone;
      changed.push('phone');
    }
    if (props.website !== undefined && (props.website ?? null) !== this._website) {
      this._website = props.website?.trim() || null;
      changed.push('website');
    }

    if (changed.length === 0) return;
    this.touch(updatedBy);
    this.addDomainEvent(
      new OrganizationUpdatedEvent({
        organizationId: this.id.value,
        updatedByUserId: updatedBy.value,
        changedFields: changed,
      }),
    );
  }

  activate(updatedBy: UserId): void {
    if (this._active) throw new OrganizationAlreadyActiveException(this.id.value);
    this._active = true;
    this.touch(updatedBy);
    this.addDomainEvent(
      new OrganizationActivatedEvent({ organizationId: this.id.value, updatedByUserId: updatedBy.value }),
    );
  }

  deactivate(updatedBy: UserId): void {
    if (!this._active) throw new OrganizationAlreadyInactiveException(this.id.value);
    if (this._isPrimary) {
      throw new PrimaryOrganizationDeactivationForbiddenException(this.id.value);
    }
    this._active = false;
    this.touch(updatedBy);
    this.addDomainEvent(
      new OrganizationDeactivatedEvent({ organizationId: this.id.value, updatedByUserId: updatedBy.value }),
    );
  }

  /** Marca esta organización como primaria. El use case es responsable de
   *  desmarcar las demás en la misma transacción. */
  markAsPrimary(updatedBy: UserId): void {
    if (this._isPrimary) return;
    if (!this._active) {
      throw new InvalidOrganizationDataException('Una organización inactiva no puede ser primaria');
    }
    this._isPrimary = true;
    this.touch(updatedBy);
    this.addDomainEvent(
      new OrganizationPrimarySetEvent({ organizationId: this.id.value, updatedByUserId: updatedBy.value }),
    );
  }

  /** Usado por el repositorio al ejecutar clearPrimaryFlag. */
  unmarkAsPrimary(updatedBy: UserId): void {
    if (!this._isPrimary) return;
    this._isPrimary = false;
    this.touch(updatedBy);
  }

  // ===== Settings ==================================================

  updateRegionalSettings(props: Parameters<RegionalSettings['replaceAll']>[0], updatedBy: UserId): void {
    this._settings.regional.replaceAll(props);
    this.touch(updatedBy);
    this.emitSettingsUpdated('regional', updatedBy);
  }

  updateFiscalSettings(props: Parameters<FiscalSettings['replaceAll']>[0], updatedBy: UserId): void {
    this._settings.fiscal.replaceAll(props);
    this.touch(updatedBy);
    this.emitSettingsUpdated('fiscal', updatedBy);
  }

  updateNotificationSettings(props: Parameters<NotificationSettings['replaceAll']>[0], updatedBy: UserId): void {
    this._settings.notifications.replaceAll(props);
    this.touch(updatedBy);
    this.emitSettingsUpdated('notifications', updatedBy);
  }

  updateBrandingSettings(props: Parameters<BrandingSettings['replaceAll']>[0], updatedBy: UserId): void {
    this._settings.branding.replaceAll(props);
    this.touch(updatedBy);
    this.emitSettingsUpdated('branding', updatedBy);
  }

  private emitSettingsUpdated(section: 'regional' | 'fiscal' | 'notifications' | 'branding', updatedBy: UserId): void {
    this.addDomainEvent(
      new OrganizationSettingsUpdatedEvent({
        organizationId: this.id.value,
        section,
        updatedByUserId: updatedBy.value,
      }),
    );
  }

  // ===== Addresses =================================================

  addAddress(addr: OrganizationAddress, updatedBy: UserId): void {
    if (addr.isPrimary) {
      this._addresses.forEach((a) => a.unmarkPrimary());
    } else if (this._addresses.length === 0) {
      addr.markPrimary();
    }
    this._addresses.push(addr);
    this.touch(updatedBy);
  }

  removeAddress(addressId: string, updatedBy: UserId): void {
    const idx = this._addresses.findIndex((a) => a.id === addressId);
    if (idx === -1) return;
    const removed = this._addresses[idx];
    this._addresses.splice(idx, 1);
    if (removed.isPrimary && this._addresses.length > 0) {
      this._addresses[0].markPrimary();
    }
    this.touch(updatedBy);
  }

  // ===== Helpers ===================================================

  private touch(updatedBy: UserId): void {
    this._updatedByUserId = updatedBy;
    this._updatedAt = new Date();
  }

  private static validateLegalName(name: string): void {
    if (!name || name.trim().length < 2 || name.trim().length > 150) {
      throw new InvalidOrganizationDataException('legalName debe tener entre 2 y 150 caracteres');
    }
  }

  private static normalizePrimaryAddress(addresses: OrganizationAddress[]): void {
    const primaries = addresses.filter((a) => a.isPrimary);
    if (primaries.length > 1) {
      // Dejar solo la primera como primary
      primaries.slice(1).forEach((a) => a.unmarkPrimary());
    } else if (primaries.length === 0 && addresses.length > 0) {
      addresses[0].markPrimary();
    }
  }
}

// Supress unused import warning for uuidv7 (kept for potential factory helpers).
void uuidv7;
