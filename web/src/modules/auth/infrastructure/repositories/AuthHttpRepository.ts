/**
 * Implementación HTTP del repositorio de autenticación
 * Realiza las llamadas a la API de autenticación
 */
import { IAuthRepository } from '../../domain/repositories/AuthRepository.interface';
import { AuthTokens } from '../../domain/entities/AuthTokens.entity';
import { User } from '../../domain/entities/User.entity';
import { apiClient } from '../../../../shared/infrastructure/http/api-client';
import { localStorageService } from '../../../../shared/infrastructure/storage/LocalStorage.service';
import { STORAGE_KEYS } from '../../application/constants/StorageKeys';
import { apiWrapperSchema } from '@/shared/infrastructure/schemas/api.schemas';
import {
  AuthTokensRawSchema,
  UserProfileSchema,
  ForgotPasswordSchema,
  VerifyResetCodeSchema,
  ResetPasswordSchema,
} from '../schemas/auth.schemas';

export class AuthHttpRepository implements IAuthRepository {
  /**
   * Inicia sesión con email y contraseña
   */
  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await apiClient.post(
      '/auth/login',
      { email, password }
    );

    // El backend devuelve snake_case (access_token, refresh_token)
    const parsed = apiWrapperSchema(AuthTokensRawSchema).parse(response);
    const tokens: AuthTokens = {
      accessToken: parsed.data.access_token,
      refreshToken: parsed.data.refresh_token,
      expiresIn: parsed.data.expires_in,
    };

    if (!tokens.accessToken || !tokens.refreshToken) {
      console.error('[AuthHttpRepository] Invalid tokens!');
      throw new Error('Estructura de tokens inválida en la respuesta');
    }

    // Guardar tokens en localStorage
    localStorageService.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorageService.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

    return tokens;
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get(
      '/auth/me',
    );
    const parsed = apiWrapperSchema(UserProfileSchema).parse(response);
    const d = parsed.data;
    return {
      id: d.id,
      email: d.email,
      name: d.name,
      role: d.role ?? '',
      isActive: d.isActive ?? d.active ?? true,
      permissions: d.permissions ?? [],
    };
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await apiClient.post(
        '/auth/logout',
        { refreshToken },
      );
    } finally {
      // Limpiar tokens independientemente del resultado
      localStorageService.remove(STORAGE_KEYS.ACCESS_TOKEN);
      localStorageService.remove(STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post(
      '/auth/refresh',
      { refreshToken }
    );

    // El backend devuelve snake_case (access_token, refresh_token)
    const parsed = apiWrapperSchema(AuthTokensRawSchema).parse(response);
    const tokens: AuthTokens = {
      accessToken: parsed.data.access_token,
      refreshToken: parsed.data.refresh_token,
      expiresIn: parsed.data.expires_in,
    };

    // Actualizar tokens en localStorage
    localStorageService.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorageService.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

    return tokens;
  }

  /**
   * Obtiene el token de acceso del localStorage
   */
  getAccessToken(): string | null {
    return localStorageService.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Obtiene el token de refresco del localStorage
   */
  getRefreshToken(): string | null {
    return localStorageService.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Solicita un código para restablecer la contraseña
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post(
      '/auth/forgot-password',
      { email }
    );

    return ForgotPasswordSchema.parse(response);
  }

  /**
   * Verifica el código de restablecimiento de contraseña
   */
  async verifyResetCode(email: string, code: string): Promise<{ message: string; isValid: boolean }> {
    const response = await apiClient.post(
      '/auth/verify-reset-code',
      { email, code }
    );
    const parsed = VerifyResetCodeSchema.parse(response);

    return {
      message: parsed.message || 'Código verificado',
      isValid: parsed.valid,
    };
  }

  /**
   * Restablece la contraseña del usuario
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post(
      '/auth/reset-password',
      { email, code, newPassword, confirmPassword: newPassword }
    );

    // Limpiar tokens al resetear contraseña
    localStorageService.remove(STORAGE_KEYS.ACCESS_TOKEN);
    localStorageService.remove(STORAGE_KEYS.REFRESH_TOKEN);

    return ResetPasswordSchema.parse(response);
  }
}
