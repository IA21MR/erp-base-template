// Tarea programada: Limpieza periódica de tokens y códigos expirados
// Se ejecuta cada día a las 3:00 AM

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject } from '@nestjs/common';
import type { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository.interface';
import type { PasswordResetRepository } from '../../domain/repositories/PasswordResetRepository.interface';
import {
  REFRESH_TOKEN_REPOSITORY,
  PASSWORD_RESET_REPOSITORY,
} from '../../Auth.Tokens';

@Injectable()
export class TokenCleanupTask {
  private readonly logger = new Logger(TokenCleanupTask.name);

  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCleanup(): Promise<void> {
    this.logger.log('Iniciando limpieza de tokens expirados...');

    try {
      await this.refreshTokenRepository.deleteExpired();
      this.logger.log('Refresh tokens expirados eliminados');
    } catch (error) {
      this.logger.error('Error limpiando refresh tokens:', error);
    }

    try {
      await this.passwordResetRepository.deleteExpired();
      this.logger.log('Códigos de reset expirados/usados eliminados');
    } catch (error) {
      this.logger.error('Error limpiando códigos de reset:', error);
    }

    this.logger.log('Limpieza de tokens completada');
  }
}
