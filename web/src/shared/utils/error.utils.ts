/**
 * Utilidades de manejo de errores
 */

/**
 * Extrae el mensaje de un error desconocido con fallback seguro.
 * Reemplaza el patrón repetido: error instanceof Error ? error.message : 'fallback'
 */
export function getErrorMessage(error: unknown, fallback = 'Ha ocurrido un error inesperado'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}

/**
 * Extrae el mensaje de error de una respuesta HTTP (Axios/fetch) con fallback.
 * Busca en error.response.data.message (Axios) y luego error.message.
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const data = (e['response'] as Record<string, unknown> | undefined)?.['data'];
    if (data && typeof data === 'object') {
      const msg = (data as Record<string, unknown>)['message'];
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) return msg.join(', ');
    }
    if (typeof e['message'] === 'string') return e['message'];
  }
  return fallback;
}
