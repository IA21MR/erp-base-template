/**
 * Funciones de formateo centralizadas para toda la aplicación.
 *
 * - formatCurrency: moneda CLP
 * - formatDate: DD/MM/YYYY (UTC, para fechas sin hora)
 * - formatDateTime: DD/MM/YYYY HH:mm (hora local del cliente)
 *
 * NO confundir con formatDateCL / formatTimeCL (shared/utils/date.utils.ts)
 * que usan explícitamente la zona 'America/Santiago'.
 */

/**
 * Formatea un monto como moneda CLP ($1.234).
 * Acepta null/undefined/NaN devolviendo "$0".
 */
export function formatCurrency(amount: number | null | undefined): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

/**
 * Formatea una fecha ISO a DD/MM/YYYY.
 * Usa timeZone: 'UTC' para evitar desplazamiento en fechas sin hora.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Formatea fecha+hora: DD/MM/YYYY HH:mm (hora local del cliente).
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
