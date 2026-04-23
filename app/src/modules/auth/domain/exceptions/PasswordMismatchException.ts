import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio para contraseñas que no coinciden
export class PasswordMismatchException extends DomainException {
  constructor(message: string = 'Las contraseñas no coinciden') {
    super(message);
  }
}
