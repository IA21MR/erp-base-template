/**
 * Aggregate Root: Contact
 *
 * Discriminado por `type` (PERSON | COMPANY). Contiene emails, phones, addresses
 * y roles como entidades hijas. Emite domain events para el outbox.
 */
import { AggregateRoot } from '../../../../shared/domain/AggregateRoot';
import { CountryCode } from '../../../../shared/domain/value-objects/CountryCode.vo';
import { TaxId } from '../../../../shared/domain/value-objects/TaxId.vo';
import { UserId } from '../../../../shared/domain/value-objects/UserId.vo';
import { ContactId } from '../value-objects/ContactId.vo';
import { ContactAddress } from './ContactAddress.entity';
import { ContactEmail } from './ContactEmail.entity';
import { ContactPhone } from './ContactPhone.entity';
import { ContactRole } from './ContactRole.entity';
import {
  ContactActivatedEvent,
  ContactAssignedEvent,
  ContactCreatedEvent,
  ContactDeactivatedEvent,
  ContactRoleAddedEvent,
  ContactRoleRemovedEvent,
  ContactUpdatedEvent,
} from '../events';
import {
  ContactAlreadyActiveException,
  ContactAlreadyInactiveException,
  ContactItemNotFoundException,
  DuplicateContactRoleException,
  InvalidContactDataException,
} from '../exceptions';

export type ContactType = 'PERSON' | 'COMPANY';

export interface PersonProps {
  personFirstName: string;
  personLastName: string;
}
export interface CompanyProps {
  companyLegalName: string;
  companyTradeName?: string | null;
}

export interface ContactProps {
  id: ContactId;
  organizationId: string;
  type: ContactType;
  personFirstName: string | null;
  personLastName: string | null;
  companyLegalName: string | null;
  companyTradeName: string | null;
  taxId: TaxId | null;
  countryCode: CountryCode | null;
  notes: string | null;
  userId: number | null;
  active: boolean;
  assignedToUserId: number | null;
  emails: ContactEmail[];
  phones: ContactPhone[];
  addresses: ContactAddress[];
  roles: ContactRole[];
  createdByUserId: UserId;
  updatedByUserId: UserId;
  createdAt: Date;
  updatedAt: Date;
}

export class Contact extends AggregateRoot {
  public readonly id: ContactId;
  public readonly organizationId: string;
  public readonly type: ContactType;
  private _personFirstName: string | null;
  private _personLastName: string | null;
  private _companyLegalName: string | null;
  private _companyTradeName: string | null;
  private _taxId: TaxId | null;
  private _countryCode: CountryCode | null;
  private _notes: string | null;
  private _userId: number | null;
  private _active: boolean;
  private _assignedToUserId: number | null;
  private _emails: ContactEmail[];
  private _phones: ContactPhone[];
  private _addresses: ContactAddress[];
  private _roles: ContactRole[];
  public readonly createdByUserId: UserId;
  private _updatedByUserId: UserId;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(p: ContactProps) {
    super();
    this.id = p.id;
    this.organizationId = p.organizationId;
    this.type = p.type;
    this._personFirstName = p.personFirstName;
    this._personLastName = p.personLastName;
    this._companyLegalName = p.companyLegalName;
    this._companyTradeName = p.companyTradeName;
    this._taxId = p.taxId;
    this._countryCode = p.countryCode;
    this._notes = p.notes;
    this._userId = p.userId;
    this._active = p.active;
    this._assignedToUserId = p.assignedToUserId;
    this._emails = p.emails;
    this._phones = p.phones;
    this._addresses = p.addresses;
    this._roles = p.roles;
    this.createdByUserId = p.createdByUserId;
    this._updatedByUserId = p.updatedByUserId;
    this.createdAt = p.createdAt;
    this._updatedAt = p.updatedAt;
  }

  // ============ factories ============

  static create(props: {
    organizationId: string;
    type: ContactType;
    person?: PersonProps;
    company?: CompanyProps;
    taxId?: TaxId | null;
    countryCode?: CountryCode | null;
    notes?: string | null;
    userId?: number | null;
    assignedToUserId?: number | null;
    emails?: ContactEmail[];
    phones?: ContactPhone[];
    addresses?: ContactAddress[];
    roles?: ContactRole[];
    createdByUserId: UserId;
  }): Contact {
    Contact.validateType(props.type, props.person, props.company);

    const now = new Date();
    const contact = new Contact({
      id: ContactId.generate(),
      organizationId: props.organizationId,
      type: props.type,
      personFirstName: props.person?.personFirstName?.trim() ?? null,
      personLastName: props.person?.personLastName?.trim() ?? null,
      companyLegalName: props.company?.companyLegalName?.trim() ?? null,
      companyTradeName: props.company?.companyTradeName?.trim() ?? null,
      taxId: props.taxId ?? null,
      countryCode: props.countryCode ?? null,
      notes: props.notes ?? null,
      userId: props.userId ?? null,
      active: true,
      assignedToUserId: props.assignedToUserId ?? null,
      emails: Contact.normalizePrimary(props.emails ?? []),
      phones: Contact.normalizePrimary(props.phones ?? []),
      addresses: Contact.normalizePrimary(props.addresses ?? []),
      roles: props.roles ?? [],
      createdByUserId: props.createdByUserId,
      updatedByUserId: props.createdByUserId,
      createdAt: now,
      updatedAt: now,
    });

    contact.addDomainEvent(
      new ContactCreatedEvent({
        contactId: contact.id.value,
        organizationId: contact.organizationId,
        type: contact.type,
        createdByUserId: props.createdByUserId.value,
      }),
    );
    return contact;
  }

  static hydrate(props: ContactProps): Contact {
    return new Contact(props);
  }

  // ============ validation ============

  private static validateType(type: ContactType, person?: PersonProps, company?: CompanyProps): void {
    if (type === 'PERSON') {
      if (!person?.personFirstName?.trim() || !person?.personLastName?.trim()) {
        throw new InvalidContactDataException('Persona requiere nombre y apellido');
      }
      if (company) {
        throw new InvalidContactDataException('Contacto PERSON no admite datos de empresa');
      }
    } else if (type === 'COMPANY') {
      if (!company?.companyLegalName?.trim()) {
        throw new InvalidContactDataException('Empresa requiere razón social');
      }
      if (person) {
        throw new InvalidContactDataException('Contacto COMPANY no admite datos de persona');
      }
    }
  }

  private static normalizePrimary<T extends { isPrimary: boolean; markPrimary: () => void; unmarkPrimary: () => void }>(
    items: T[],
  ): T[] {
    const primaries = items.filter((x) => x.isPrimary);
    if (items.length > 0 && primaries.length === 0) {
      items[0].markPrimary();
    }
    if (primaries.length > 1) {
      primaries.slice(1).forEach((p) => p.unmarkPrimary());
    }
    return items;
  }

  private touch(updatedBy: UserId): void {
    this._updatedByUserId = updatedBy;
    this._updatedAt = new Date();
  }

  // ============ getters ============
  get personFirstName(): string | null { return this._personFirstName; }
  get personLastName(): string | null { return this._personLastName; }
  get companyLegalName(): string | null { return this._companyLegalName; }
  get companyTradeName(): string | null { return this._companyTradeName; }
  get taxId(): TaxId | null { return this._taxId; }
  get countryCode(): CountryCode | null { return this._countryCode; }
  get notes(): string | null { return this._notes; }
  get userId(): number | null { return this._userId; }
  get active(): boolean { return this._active; }
  get assignedToUserId(): number | null { return this._assignedToUserId; }
  get emails(): readonly ContactEmail[] { return this._emails; }
  get phones(): readonly ContactPhone[] { return this._phones; }
  get addresses(): readonly ContactAddress[] { return this._addresses; }
  get roles(): readonly ContactRole[] { return this._roles; }
  get updatedByUserId(): UserId { return this._updatedByUserId; }
  get updatedAt(): Date { return this._updatedAt; }

  get displayName(): string {
    if (this.type === 'PERSON') {
      return `${this._personFirstName ?? ''} ${this._personLastName ?? ''}`.trim();
    }
    return this._companyTradeName ?? this._companyLegalName ?? '';
  }

  // ============ mutators ============

  update(
    patch: {
      personFirstName?: string;
      personLastName?: string;
      companyLegalName?: string;
      companyTradeName?: string | null;
      taxId?: TaxId | null;
      countryCode?: CountryCode | null;
      notes?: string | null;
      userId?: number | null;
    },
    updatedBy: UserId,
  ): void {
    const changed: string[] = [];
    if (this.type === 'PERSON') {
      if (patch.personFirstName !== undefined && patch.personFirstName.trim() !== this._personFirstName) {
        if (!patch.personFirstName.trim()) throw new InvalidContactDataException('Nombre es requerido');
        this._personFirstName = patch.personFirstName.trim();
        changed.push('personFirstName');
      }
      if (patch.personLastName !== undefined && patch.personLastName.trim() !== this._personLastName) {
        if (!patch.personLastName.trim()) throw new InvalidContactDataException('Apellido es requerido');
        this._personLastName = patch.personLastName.trim();
        changed.push('personLastName');
      }
    } else {
      if (patch.companyLegalName !== undefined && patch.companyLegalName.trim() !== this._companyLegalName) {
        if (!patch.companyLegalName.trim()) throw new InvalidContactDataException('Razón social es requerida');
        this._companyLegalName = patch.companyLegalName.trim();
        changed.push('companyLegalName');
      }
      if (patch.companyTradeName !== undefined) {
        const v = patch.companyTradeName?.trim() || null;
        if (v !== this._companyTradeName) { this._companyTradeName = v; changed.push('companyTradeName'); }
      }
    }
    if (patch.taxId !== undefined) {
      this._taxId = patch.taxId;
      changed.push('taxId');
    }
    if (patch.countryCode !== undefined) {
      this._countryCode = patch.countryCode;
      changed.push('countryCode');
    }
    if (patch.notes !== undefined) {
      this._notes = patch.notes?.trim() || null;
      changed.push('notes');
    }
    if (patch.userId !== undefined) {
      this._userId = patch.userId;
      changed.push('userId');
    }
    if (changed.length > 0) {
      this.touch(updatedBy);
      this.addDomainEvent(
        new ContactUpdatedEvent({
          contactId: this.id.value,
          changedFields: changed,
          updatedByUserId: updatedBy.value,
        }),
      );
    }
  }

  activate(updatedBy: UserId): void {
    if (this._active) throw new ContactAlreadyActiveException(this.id.value);
    this._active = true;
    this.touch(updatedBy);
    this.addDomainEvent(new ContactActivatedEvent({ contactId: this.id.value, updatedByUserId: updatedBy.value }));
  }

  deactivate(updatedBy: UserId): void {
    if (!this._active) throw new ContactAlreadyInactiveException(this.id.value);
    this._active = false;
    this.touch(updatedBy);
    this.addDomainEvent(new ContactDeactivatedEvent({ contactId: this.id.value, updatedByUserId: updatedBy.value }));
  }

  assignTo(userId: number | null, updatedBy: UserId): void {
    if (this._assignedToUserId === userId) return;
    this._assignedToUserId = userId;
    this.touch(updatedBy);
    this.addDomainEvent(
      new ContactAssignedEvent({
        contactId: this.id.value,
        assignedToUserId: userId,
        updatedByUserId: updatedBy.value,
      }),
    );
  }

  // ============ roles ============
  addRole(role: ContactRole, updatedBy: UserId): void {
    if (this._roles.some((r) => r.roleTypeId === role.roleTypeId)) {
      throw new DuplicateContactRoleException(role.roleTypeId);
    }
    this._roles.push(role);
    this.touch(updatedBy);
    this.addDomainEvent(
      new ContactRoleAddedEvent({
        contactId: this.id.value,
        roleTypeId: role.roleTypeId,
        updatedByUserId: updatedBy.value,
      }),
    );
  }

  removeRole(roleId: string, updatedBy: UserId): void {
    const idx = this._roles.findIndex((r) => r.id === roleId);
    if (idx < 0) throw new ContactItemNotFoundException('ContactRole', roleId);
    const [removed] = this._roles.splice(idx, 1);
    this.touch(updatedBy);
    this.addDomainEvent(
      new ContactRoleRemovedEvent({
        contactId: this.id.value,
        roleTypeId: removed.roleTypeId,
        updatedByUserId: updatedBy.value,
      }),
    );
  }

  // ============ emails ============
  addEmail(email: ContactEmail, updatedBy: UserId): void {
    if (email.isPrimary) this._emails.forEach((e) => e.unmarkPrimary());
    this._emails.push(email);
    Contact.normalizePrimary(this._emails);
    this.touch(updatedBy);
  }

  updateEmail(emailId: string, patch: { email?: string; label?: string | null }, updatedBy: UserId): void {
    const e = this._emails.find((x) => x.id === emailId);
    if (!e) throw new ContactItemNotFoundException('ContactEmail', emailId);
    e.update(patch);
    this.touch(updatedBy);
  }

  removeEmail(emailId: string, updatedBy: UserId): void {
    const idx = this._emails.findIndex((e) => e.id === emailId);
    if (idx < 0) throw new ContactItemNotFoundException('ContactEmail', emailId);
    this._emails.splice(idx, 1);
    Contact.normalizePrimary(this._emails);
    this.touch(updatedBy);
  }

  setPrimaryEmail(emailId: string, updatedBy: UserId): void {
    const e = this._emails.find((x) => x.id === emailId);
    if (!e) throw new ContactItemNotFoundException('ContactEmail', emailId);
    this._emails.forEach((x) => x.unmarkPrimary());
    e.markPrimary();
    this.touch(updatedBy);
  }

  // ============ phones ============
  addPhone(phone: ContactPhone, updatedBy: UserId): void {
    if (phone.isPrimary) this._phones.forEach((p) => p.unmarkPrimary());
    this._phones.push(phone);
    Contact.normalizePrimary(this._phones);
    this.touch(updatedBy);
  }

  updatePhone(phoneId: string, patch: { phone?: string; label?: string | null }, updatedBy: UserId): void {
    const p = this._phones.find((x) => x.id === phoneId);
    if (!p) throw new ContactItemNotFoundException('ContactPhone', phoneId);
    p.update(patch);
    this.touch(updatedBy);
  }

  removePhone(phoneId: string, updatedBy: UserId): void {
    const idx = this._phones.findIndex((p) => p.id === phoneId);
    if (idx < 0) throw new ContactItemNotFoundException('ContactPhone', phoneId);
    this._phones.splice(idx, 1);
    Contact.normalizePrimary(this._phones);
    this.touch(updatedBy);
  }

  setPrimaryPhone(phoneId: string, updatedBy: UserId): void {
    const p = this._phones.find((x) => x.id === phoneId);
    if (!p) throw new ContactItemNotFoundException('ContactPhone', phoneId);
    this._phones.forEach((x) => x.unmarkPrimary());
    p.markPrimary();
    this.touch(updatedBy);
  }

  // ============ addresses ============
  addAddress(address: ContactAddress, updatedBy: UserId): void {
    if (address.isPrimary) this._addresses.forEach((a) => a.unmarkPrimary());
    this._addresses.push(address);
    Contact.normalizePrimary(this._addresses);
    this.touch(updatedBy);
  }

  updateAddress(addressId: string, patch: Parameters<ContactAddress['update']>[0], updatedBy: UserId): void {
    const a = this._addresses.find((x) => x.id === addressId);
    if (!a) throw new ContactItemNotFoundException('ContactAddress', addressId);
    a.update(patch);
    this.touch(updatedBy);
  }

  removeAddress(addressId: string, updatedBy: UserId): void {
    const idx = this._addresses.findIndex((a) => a.id === addressId);
    if (idx < 0) throw new ContactItemNotFoundException('ContactAddress', addressId);
    this._addresses.splice(idx, 1);
    Contact.normalizePrimary(this._addresses);
    this.touch(updatedBy);
  }

  setPrimaryAddress(addressId: string, updatedBy: UserId): void {
    const a = this._addresses.find((x) => x.id === addressId);
    if (!a) throw new ContactItemNotFoundException('ContactAddress', addressId);
    this._addresses.forEach((x) => x.unmarkPrimary());
    a.markPrimary();
    this.touch(updatedBy);
  }
}
