import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio: Token de refresco inválido
// Se lanza cuando el refresh token no existe o no coincide
export class InvalidRefreshTokenException extends DomainException {
  constructor(message: string = 'Token de refresco inválido') {
    super(message);
  }
}
