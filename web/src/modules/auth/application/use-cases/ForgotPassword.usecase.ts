/**
 * Caso de uso: Solicitar restablecimiento de contraseña
 * Envía un código de verificación al email del usuario
 */
import { IAuthRepository } from '../../domain/repositories/AuthRepository.interface';
import { ForgotPasswordDTO } from '../dtos/ForgotPassword.dto';

export class ForgotPasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Ejecuta el caso de uso de forgot password
   * @param data - Email del usuario
   * @returns Mensaje de confirmación
   */
  async execute(data: ForgotPasswordDTO): Promise<{ message: string }> {
    const { email } = data;

    // Validación básica
    if (!email) {
      throw new Error('El email es requerido');
    }

    // Delegar al repositorio
    return await this.authRepository.forgotPassword(email);
  }
}
