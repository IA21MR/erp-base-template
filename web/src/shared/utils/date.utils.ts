/**
 * Utilidades de formateo de fechas para toda la aplicación.
 *
 * La zona horaria se define UNA SOLA VEZ aquí — 'America/Santiago'.
 * Esta zona incluye automáticamente los cambios de horario de verano/invierno
 * de Chile (DST) mediante la base de datos IANA que incluye Node.js y los browsers.
 *
 * - En el servidor (SSR / NestJS): el container Docker tiene TZ=America/Santiago,
 *   lo que refuerza el mismo comportamiento a nivel de proceso.
 * - En el browser del cliente: se aplica la zona explícita de estas funciones
 *   sin importar la configuración local del usuario.
 */

const CHILE_TZ = 'America/Santiago';

/**
 * Formatea una fecha como DD-MM-YYYY en la hora de Chile.
 * @example formatDateCL(new Date('2026-03-15T00:00:00Z')) → "14-03-2026" (hora Santiago)
 */
export function formatDateCL(date: Date): string {
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: CHILE_TZ,
  });
}

/**
 * Formatea un valor de fecha ISO (YYYY-MM-DD o ISO datetime) a fecha chilena legible.
 * Usa una construcción local en mediodía para evitar corrimientos de día por zona horaria.
 */
export function formatISODateCL(value: string | Date | null | undefined): string {
  if (!value) return '';

  if (value instanceof Date) {
    return formatDateCL(value);
  }

  const datePartMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (datePartMatch) {
    const year = Number(datePartMatch[1]);
    const month = Number(datePartMatch[2]);
    const day = Number(datePartMatch[3]);
    return formatDateCL(new Date(year, month - 1, day, 12, 0, 0));
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return formatDateCL(parsed);
}

/**
 * Formatea la hora como HH:mm en la hora de Chile.
 * @example formatTimeCL(new Date('2026-03-15T03:00:00Z')) → "00:00"
 */
export function formatTimeCL(date: Date): string {
  return date.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: CHILE_TZ,
  });
}

/**
 * Convierte una fecha a formato YYYY-MM-DD usando fecha local (sin conversión UTC).
 * Evita el desfase silencioso que ocurre con toISOString().split('T')[0].
 */
export function toDateInputValue(date: Date): string {
  if (!date || Number.isNaN(date.getTime())) {
    return toDateInputValue(new Date());
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convierte una fecha "YYYY-MM-DD" a ISO 8601 con la hora actual del cliente.
 *
 * Sin esto, el backend recibe solo la fecha y Postgres la almacena como
 * medianoche UTC, que en Chile (UTC-3) aparece como las 21:00 del día anterior.
 * Si el string ya contiene hora (largo > 10), se devuelve sin cambios.
 *
 * @example dateOnlyToISOWithCurrentTime('2026-03-13') → '2026-03-13T15:16:00.000Z' (si son 12:16 en Chile)
 */
export function dateOnlyToISOWithCurrentTime(dateStr: string): string {
  if (dateStr.length > 10) return dateStr;
  const now = new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
}

/**
 * Convierte una fecha "YYYY-MM-DD" a ISO 8601 usando las 12:00 (mediodía) local.
 *
 * Esta función es útil para fechas de entrega/devolución donde solo importa el día,
 * no la hora específica. Usar mediodía evita problemas de cambio de día por zona horaria
 * (12:00 en Chile = 15:00 UTC, siempre el mismo día).
 *
 * @example dateOnlyToISOMidday('2026-03-14') → '2026-03-14T15:00:00.000Z' (12:00 Chile)
 */
export function dateOnlyToISOMidday(dateStr: string): string {
  if (dateStr.length > 10) return dateStr;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).toISOString();
}

// Re-export desde number.utils para backward compatibility
export { formatCLP } from './number.utils';

/**
 * Devuelve el nombre del mes en español (1 = Enero, 12 = Diciembre).
 */
export function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return months[month - 1] ?? '';
}
