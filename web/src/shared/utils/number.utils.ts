/**
 * Utilidades de formateo numérico para inputs.
 *
 * Formato chileno: punto como separador de miles, sin decimales para CLP.
 * Ejemplo: 1500000 → "1.500.000"
 */

/**
 * Formatea un monto como moneda CLP sin decimales.
 * @example formatCLP(18000) → "$18.000"
 */
export function formatCLP(amount: number): string {
  return amount.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
}

/**
 * Formatea un número con separador de miles (punto).
 * Solo enteros — se usa en campos de montos CLP y cantidades.
 * @example formatThousands(1500000) → "1.500.000"
 * @example formatThousands(0) → "0"
 */
export function formatThousands(value: number): string {
  return value.toLocaleString('es-CL');
}

/**
 * Extrae solo dígitos de un string formateado y devuelve el número.
 * @example parseFormattedNumber("1.500.000") → 1500000
 * @example parseFormattedNumber("") → 0
 */
export function parseFormattedNumber(formatted: string): number {
  const digits = formatted.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Handler genérico para onChange de un input formateado.
 * Filtra todo excepto dígitos, formatea con separador de miles,
 * y llama al callback con el valor numérico real.
 *
 * @param rawValue - El valor del input (e.target.value)
 * @param onChange - Callback que recibe el número limpio
 * @returns El string formateado para mostrar en el input
 */
export function handleFormattedChange(
  rawValue: string,
  onChange: (num: number | undefined) => void,
): string {
  const digits = rawValue.replace(/\D/g, '');
  if (!digits) {
    onChange(undefined);
    return '';
  }
  const num = parseInt(digits, 10);
  onChange(num);
  return formatThousands(num);
}

/**
 * Formatea un precio en CLP con símbolo de moneda.
 * @example formatPrice(150000) → "$150.000"
 * @example formatPrice(null) → "-"
 */
export function formatPrice(price: number | null): string {
  if (!price) return '-';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);
}
