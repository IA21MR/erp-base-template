// Caso de uso: Logout
// Invalida el refresh token del usuario para cerrar sesión

import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository.interface';
import { LogoutCommand } from '../commands/LogoutCommand';
import { LogoutResult } from '../results/LogoutResult';

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(command: LogoutCommand): Promise<LogoutResult> {
    // Eliminar todos los refresh tokens del usuario
    await this.refreshTokenRepository.deleteByUserId(command.userId);

    return new LogoutResult('Sesión cerrada exitosamente');
  }
}
