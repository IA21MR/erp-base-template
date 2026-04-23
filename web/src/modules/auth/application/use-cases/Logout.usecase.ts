/**
 * Caso de uso: Logout
 * 
 * Responsabilidades:
 * - Invalidar el refresh token en el servidor
 * 
 * La limpieza de tokens locales y cookies es responsabilidad
 * de la capa de presentación (hook)
 */

import { IAuthRepository } from '../../domain/repositories/AuthRepository.interface';

export class LogoutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Ejecuta el logout invalidando el token en el servidor
   * @param refreshToken - Token de refresh para invalidar en el servidor
   */
  async execute(refreshToken: string | null): Promise<void> {
    if (!refreshToken) return;

    try {
      await this.authRepository.logout(refreshToken);
    } catch (error) {
      // Loguear el error pero no interrumpir — el caller limpiará los tokens locales
      console.error('Error al invalidar token en servidor:', error);
    }
  }
}
