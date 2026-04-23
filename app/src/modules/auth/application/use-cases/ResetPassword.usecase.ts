// Caso de uso: Restablecer contraseña
// Valida código, verifica que las contraseñas coincidan y actualiza la contraseña del usuario

import { UserRepository } from '../../../users/domain/repositories/UserRepository.interface';
import { PasswordResetRepository } from '../../domain/repositories/PasswordResetRepository.interface';
import { PasswordHasher } from '../../domain/services/PasswordHasher.interface';
import { ResetPasswordCommand } from '../commands/ResetPasswordCommand';
import { ResetPasswordResult } from '../results/ResetPasswordResult';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFoundException';
import { InactiveUserException } from '../../domain/exceptions/InactiveUserException';
import { PasswordMismatchException } from '../../domain/exceptions/PasswordMismatchException';
import { InvalidResetCodeException } from '../../domain/exceptions/InvalidResetCodeException';
import { ExpiredResetCodeException } from '../../domain/exceptions/ExpiredResetCodeException';
import { UsedResetCodeException } from '../../domain/exceptions/UsedResetCodeException';
import { WeakPasswordException } from '../../domain/exceptions/WeakPasswordException';

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(command: ResetPasswordCommand): Promise<ResetPasswordResult> {
    // Validar que las contraseñas coincidan
    if (command.newPassword !== command.confirmPassword) {
      throw new PasswordMismatchException();
    }

    // Validar fortaleza de la contraseña
    this.validatePasswordStrength(command.newPassword);

    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(command.email);

    if (!user) {
      throw new UserNotFoundException();
    }

    // Verificar que el usuario esté activo
    if (!user.isActive()) {
      throw new InactiveUserException();
    }

    // Buscar el último código del usuario
    const resetCode = await this.passwordResetRepository.findLatestByUser(user.id);

    if (!resetCode) {
      throw new InvalidResetCodeException();
    }

    // Validar que el código sea válido (no usado y no expirado)
    if (!resetCode.isValid()) {
      if (resetCode.used) {
        throw new UsedResetCodeException();
      }
      if (resetCode.isExpired()) {
        throw new ExpiredResetCodeException();
      }
      throw new InvalidResetCodeException('Código inválido');
    }

    // Comparar código plano con el hash almacenado
    const isCodeValid = await this.passwordHasher.compare(command.code, resetCode.code);
    if (!isCodeValid) {
      throw new InvalidResetCodeException();
    }

    // Hashear la nueva contraseña
    const newPasswordHash = await this.passwordHasher.hash(command.newPassword);

    // Actualizar la contraseña del usuario
    user.updatePassword(newPasswordHash);
    await this.userRepository.update(user);

    // Marcar el código como usado
    await this.passwordResetRepository.markAsUsed(resetCode.id);

    return new ResetPasswordResult(true, 'Contraseña actualizada exitosamente');
  }

  // Validar fortaleza de la contraseña
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new WeakPasswordException('La contraseña debe tener al menos 8 caracteres');
    }

    // Validar que contenga al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
      throw new WeakPasswordException('La contraseña debe contener al menos una letra mayúscula');
    }

    // Validar que contenga al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
      throw new WeakPasswordException('La contraseña debe contener al menos una letra minúscula');
    }

    // Validar que contenga al menos un número
    if (!/[0-9]/.test(password)) {
      throw new WeakPasswordException('La contraseña debe contener al menos un número');
    }
  }
}
