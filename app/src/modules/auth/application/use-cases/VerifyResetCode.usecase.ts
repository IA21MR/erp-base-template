// Caso de uso: Verificar código de restablecimiento
// Valida que el código sea correcto, no haya expirado y no esté usado

import { UserRepository } from '../../../users/domain/repositories/UserRepository.interface';
import { PasswordResetRepository } from '../../domain/repositories/PasswordResetRepository.interface';
import { PasswordHasher } from '../../domain/services/PasswordHasher.interface';
import { VerifyResetCodeCommand } from '../commands/VerifyResetCodeCommand';
import { VerifyResetCodeResult } from '../results/VerifyResetCodeResult';

export class VerifyResetCodeUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: VerifyResetCodeCommand): Promise<VerifyResetCodeResult> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(command.email);

    if (!user) {
      return new VerifyResetCodeResult(false, 'Código inválido o expirado');
    }

    // Verificar que el usuario esté activo
    if (!user.isActive()) {
      return new VerifyResetCodeResult(false, 'Usuario inactivo');
    }

    // Buscar el último código del usuario
    const resetCode = await this.passwordResetRepository.findLatestByUser(user.id);

    if (!resetCode) {
      return new VerifyResetCodeResult(false, 'Código inválido o expirado');
    }

    // Validar que el código no esté usado y no esté expirado
    if (!resetCode.isValid()) {
      if (resetCode.used) {
        return new VerifyResetCodeResult(false, 'Código ya utilizado');
      }
      if (resetCode.isExpired()) {
        return new VerifyResetCodeResult(false, 'Código expirado');
      }
      return new VerifyResetCodeResult(false, 'Código inválido');
    }

    // Comparar código plano con el hash almacenado
    const isCodeValid = await this.passwordHasher.compare(command.code, resetCode.code);
    if (!isCodeValid) {
      return new VerifyResetCodeResult(false, 'Código inválido o expirado');
    }

    // Código válido
    return new VerifyResetCodeResult(true);
  }
}
