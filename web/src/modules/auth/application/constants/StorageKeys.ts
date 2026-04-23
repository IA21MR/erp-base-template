/**
 * Claves de almacenamiento local para tokens de autenticación
 * Definidas en la capa de aplicación para que todas las capas puedan importarlas
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;
