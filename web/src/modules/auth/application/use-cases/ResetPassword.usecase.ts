/**
 * Caso de uso: Restablecer contraseña
 * Cambia la contraseña del usuario usando el código de verificación
 */
import { IAuthRepository } from '../../domain/repositories/AuthRepository.interface';
import { ResetPasswordDTO } from '../dtos/ResetPassword.dto';

export class ResetPasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Ejecuta el caso de uso de reset password
   * @param data - Email, código y nueva contraseña
   * @returns Mensaje de confirmación
   */
  async execute(data: ResetPasswordDTO): Promise<{ message: string }> {
    const { email, code, newPassword } = data;

    // Validación básica
    if (!email || !code || !newPassword) {
      throw new Error('Email, código y nueva contraseña son requeridos');
    }

    if (newPassword.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Delegar al repositorio
    return await this.authRepository.resetPassword(email, code, newPassword);
  }
}
