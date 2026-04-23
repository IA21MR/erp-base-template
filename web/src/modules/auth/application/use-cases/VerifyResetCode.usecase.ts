/**
 * Caso de uso: Verificar código de restablecimiento
 * Valida que el código enviado al email sea correcto
 */
import { IAuthRepository } from '../../domain/repositories/AuthRepository.interface';
import { VerifyResetCodeDTO } from '../dtos/VerifyResetCode.dto';

export class VerifyResetCodeUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Ejecuta el caso de uso de verificación de código
   * @param data - Email y código a verificar
   * @returns Mensaje de confirmación
   */
  async execute(data: VerifyResetCodeDTO): Promise<{ message: string; isValid: boolean }> {
    const { email, code } = data;

    // Validación básica
    if (!email || !code) {
      throw new Error('Email y código son requeridos');
    }

    // Delegar al repositorio
    return await this.authRepository.verifyResetCode(email, code);
  }
}
