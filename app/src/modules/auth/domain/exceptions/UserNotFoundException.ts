import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio para usuario no encontrado
export class UserNotFoundException extends DomainException {
  constructor(message: string = 'Usuario no encontrado') {
    super(message);
  }
}
