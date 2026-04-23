/**
 * Interfaz del repositorio de autenticación
 * Define el contrato para las operaciones de autenticación
 */
import { AuthTokens } from '../entities/AuthTokens.entity';
import { User } from '../entities/User.entity';

export interface IAuthRepository {
  /**
   * Inicia sesión con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Tokens de autenticación
   */
  login(email: string, password: string): Promise<AuthTokens>;

  /**
   * Obtiene el perfil del usuario autenticado
   * @returns Usuario autenticado
   */
  getProfile(): Promise<User>;

  /**
   * Cierra la sesión del usuario
   * @param refreshToken - Token de refresco para invalidar
   */
  logout(refreshToken: string): Promise<void>;

  /**
   * Refresca el token de acceso
   * @param refreshToken - Token de refresco
   * @returns Nuevos tokens de autenticación
   */
  refreshToken(refreshToken: string): Promise<AuthTokens>;

  /**
   * Solicita un código para restablecer la contraseña
   * @param email - Email del usuario
   * @returns Mensaje de confirmación
   */
  forgotPassword(email: string): Promise<{ message: string }>;

  /**
   * Verifica el código de restablecimiento de contraseña
   * @param email - Email del usuario
   * @param code - Código de verificación
   * @returns Confirmación de validez del código
   */
  verifyResetCode(email: string, code: string): Promise<{ message: string; isValid: boolean }>;

  /**
   * Restablece la contraseña del usuario
   * @param email - Email del usuario
   * @param code - Código de verificación
   * @param newPassword - Nueva contraseña
   * @returns Mensaje de confirmación
   */
  resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }>;

  /**
   * Retorna el token de acceso almacenado (si existe)
   */
  getAccessToken(): string | null;
}
