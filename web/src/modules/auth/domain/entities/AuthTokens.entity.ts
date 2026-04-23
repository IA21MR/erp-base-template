/**
 * Entidad de dominio: Tokens de autenticación
 * Representa los tokens JWT de acceso y refresco
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
