import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio para usuario inactivo
export class InactiveUserException extends DomainException {
  constructor(message: string = 'Usuario inactivo. Contacte al administrador') {
    super(message);
  }
}
