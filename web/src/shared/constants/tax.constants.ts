/**
 * Tasa de IVA vigente en Chile (19%).
 *
 * Precios almacenados SIEMPRE incluyen IVA.
 * La descomposición es:
 *   neto = round(total / TAX_RATE)
 *   iva  = round(total − neto)
 */
export const TAX_RATE = 1.19;
export const TAX_PERCENTAGE = 0.19;
