// Puerto (Interface) para el generador de tokens JWT
// Abstrae la implementación concreta de JWT

export interface TokenPayload {
  sub: number; // User ID
  email: string;
  /**
   * Organización activa del usuario (multi-tenant).
   * Puede ser `null` si el usuario aún no tiene organización asignada
   * (ej: super-admin del bootstrap antes de crear la primary).
   */
  organizationId: string | null;
  roles: string[];
  permissions: string[];
}

export interface RefreshTokenPayload {
  sub: number; // User ID
  email: string;
  /**
   * Guardamos la organización también en el refresh token para que el
   * nuevo access token derivado mantenga el mismo contexto multi-tenant.
   */
  organizationId: string | null;
}

export interface TokenGenerator {
  /**
   * Genera un token JWT a partir de un payload
   * @param payload - Datos a incluir en el token
   * @returns string - Token JWT generado
   */
  sign(payload: TokenPayload): string;

  /**
   * Genera un refresh token JWT con expiración más larga
   * @param payload - Datos a incluir en el refresh token
   * @returns string - Refresh token JWT generado
   */
  signRefresh(payload: RefreshTokenPayload): string;

  /**
   * Verifica y decodifica un token JWT
   * @param token - Token JWT a verificar
   * @returns TokenPayload - Payload decodificado
   */
  verify(token: string): TokenPayload;

  /**
   * Verifica y decodifica un refresh token JWT (usa secret separado)
   * @param token - Refresh token JWT a verificar
   * @returns RefreshTokenPayload - Payload decodificado
   */
  verifyRefresh(token: string): RefreshTokenPayload;
}
