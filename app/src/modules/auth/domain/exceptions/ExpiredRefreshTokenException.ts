import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio: Token de refresco expirado
// Se lanza cuando el refresh token ha superado su tiempo de vida
export class ExpiredRefreshTokenException extends DomainException {
  constructor(message: string = 'El token de refresco ha expirado') {
    super(message);
  }
}
