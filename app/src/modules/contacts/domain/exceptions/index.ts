import { DomainException } from '../../../../shared/domain/DomainException';

export class ContactNotFoundException extends DomainException {
  constructor(id: string) { super(`Contacto no encontrado: ${id}`); this.name = 'ContactNotFoundException'; }
}
export class DuplicateContactTaxIdException extends DomainException {
  constructor(taxId: string, countryCode: string, organizationId: string) {
    super(`Ya existe un contacto con RUT/Tax ID ${taxId} (${countryCode}) en la organización ${organizationId}`);
    this.name = 'DuplicateContactTaxIdException';
  }
}
export class InvalidContactDataException extends DomainException {
  constructor(msg: string) { super(msg); this.name = 'InvalidContactDataException'; }
}
export class ContactAlreadyActiveException extends DomainException {
  constructor(id: string) { super(`Contacto ${id} ya está activo`); this.name = 'ContactAlreadyActiveException'; }
}
export class ContactAlreadyInactiveException extends DomainException {
  constructor(id: string) { super(`Contacto ${id} ya está inactivo`); this.name = 'ContactAlreadyInactiveException'; }
}
export class ContactRoleNotFoundException extends DomainException {
  constructor(id: string) { super(`Rol de contacto no encontrado: ${id}`); this.name = 'ContactRoleNotFoundException'; }
}
export class ContactRoleTypeNotFoundException extends DomainException {
  constructor(id: string) { super(`Tipo de rol no encontrado: ${id}`); this.name = 'ContactRoleTypeNotFoundException'; }
}
export class DuplicateContactRoleException extends DomainException {
  constructor(roleTypeId: string) { super(`El contacto ya tiene asignado el rol ${roleTypeId}`); this.name = 'DuplicateContactRoleException'; }
}
export class ContactItemNotFoundException extends DomainException {
  constructor(kind: string, id: string) { super(`${kind} ${id} no encontrado en el contacto`); this.name = 'ContactItemNotFoundException'; }
}
