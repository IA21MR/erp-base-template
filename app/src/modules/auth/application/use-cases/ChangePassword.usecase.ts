// Caso de uso: Cambiar contraseña
// Permite al usuario autenticado cambiar su contraseña verificando la actual

import { UserRepository } from '../../../users/domain/repositories/UserRepository.interface';
import { PasswordHasher } from '../../domain/services/PasswordHasher.interface';
import { ChangePasswordCommand } from '../commands/ChangePasswordCommand';
import { ChangePasswordResult } from '../results/ChangePasswordResult';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFoundException';
import { InvalidCredentialsException } from '../../domain/exceptions/InvalidCredentialsException';
import { PasswordMismatchException } from '../../domain/exceptions/PasswordMismatchException';
import { WeakPasswordException } from '../../domain/exceptions/WeakPasswordException';

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(command: ChangePasswordCommand): Promise<ChangePasswordResult> {
    // Validar que las contraseñas coincidan
    if (command.newPassword !== command.confirmPassword) {
      throw new PasswordMismatchException();
    }

    // Validar fortaleza de la nueva contraseña
    this.validatePasswordStrength(command.newPassword);

    // Buscar usuario por ID
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await this.passwordHasher.compare(
      command.currentPassword,
      user.passwordHash
    );
    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Hashear la nueva contraseña y actualizar
    const newPasswordHash = await this.passwordHasher.hash(command.newPassword);
    user.updatePassword(newPasswordHash);
    await this.userRepository.update(user);

    return new ChangePasswordResult(
      true,
      'Contraseña actualizada exitosamente'
    );
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new WeakPasswordException(
        'La contraseña debe tener al menos 8 caracteres'
      );
    }
    if (!/[A-Z]/.test(password)) {
      throw new WeakPasswordException(
        'La contraseña debe contener al menos una letra mayúscula'
      );
    }
    if (!/[a-z]/.test(password)) {
      throw new WeakPasswordException(
        'La contraseña debe contener al menos una letra minúscula'
      );
    }
    if (!/[0-9]/.test(password)) {
      throw new WeakPasswordException(
        'La contraseña debe contener al menos un número'
      );
    }
  }
}
