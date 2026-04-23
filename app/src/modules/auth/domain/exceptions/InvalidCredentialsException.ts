import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio para credenciales inválidas
export class InvalidCredentialsException extends DomainException {
  constructor(message: string = 'Credenciales inválidas') {
    super(message);
  }
}
