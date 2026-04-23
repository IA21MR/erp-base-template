/**
 * TenantContext — abstracción core de multi-tenancy.
 *
 * Representa el contexto del tenant activo durante la ejecución de un caso
 * de uso. Los módulos core (users, auth) dependen SOLO de esta abstracción;
 * NO importan nada de `modules/organizations`.
 *
 * El módulo `organizations` es un **provider** de `TenantContext`:
 * su middleware/guard resuelve el tenant desde el JWT y lo propaga.
 * Si `organizations` no está activo, `TenantContext` simplemente es `null`
 * en todos los puntos de consumo y la aplicación funciona en modo single-tenant.
 */
export interface TenantContext {
  readonly tenantId: string;
}

/**
 * Helper: extrae el `tenantId` de un contexto opcional. Devuelve `null` si
 * `organizations` no está activo (y por tanto no hay contexto).
 */
export function getTenantId(ctx: TenantContext | null | undefined): string | null {
  return ctx?.tenantId ?? null;
}
