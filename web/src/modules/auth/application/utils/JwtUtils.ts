/**
 * Utilidad para decodificar JWT sin validar firma
 * Solo lee el payload — NO debe usarse para verificar autenticidad
 */

export interface JwtPayload {
  sub: number;
  email: string;
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Decodifica un JWT sin validar (solo para leer el payload del lado cliente)
 */
export function decodeJWT(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
