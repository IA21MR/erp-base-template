import { DomainException } from '../../../../shared/domain/DomainException';

export class OrganizationNotFoundException extends DomainException {
  constructor(id?: string) {
    super(id ? `Organización con ID ${id} no encontrada` : 'Organización no encontrada');
  }
}

export class DuplicateOrganizationTaxIdException extends DomainException {
  constructor(taxId: string, countryCode: string) {
    super(`Ya existe una organización con TaxId ${taxId} en el país ${countryCode}`);
  }
}

export class InvalidOrganizationDataException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class OrganizationAlreadyActiveException extends DomainException {
  constructor(id: string) {
    super(`La organización ${id} ya está activa`);
  }
}

export class OrganizationAlreadyInactiveException extends DomainException {
  constructor(id: string) {
    super(`La organización ${id} ya está inactiva`);
  }
}

export class PrimaryOrganizationDeactivationForbiddenException extends DomainException {
  constructor(id: string) {
    super(`No se puede desactivar la organización primaria (${id})`);
  }
}
