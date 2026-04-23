/**
 * Puerto del Auth Context Provider.
 *
 * Resuelve el contexto multi-tenant del usuario autenticado:
 *   - Organización activa (por defecto, la primaria).
 *   - Nombres de roles (para enriquecer el JWT).
 *
 * Vive en la capa de aplicación del módulo Auth porque el login/refresh
 * necesita materializar estos datos EN EL JWT. El adaptador concreto se
 * apoya en los repositorios de otros módulos (Organizations, Users) sin
 * acoplar el dominio de Auth a ellos.
 *
 * ⚠️  NO forma parte del dominio. Es un puerto de aplicación.
 */
export interface AuthContextProvider {
  /**
   * Retorna la organización que debe ir asociada al JWT del usuario.
   *
   * Estrategia por defecto (hasta que exista tabla user_organization):
   *   1. Organización primaria (`isPrimary = true`).
   *   2. `null` si el sistema aún no tiene organización.
   *
   * @param userId id del usuario autenticado
   */
  resolveOrganizationIdForUser(userId: number): Promise<string | null>;

  /**
   * Retorna los nombres (códigos) de los roles asignados al usuario.
   * Se usan únicamente a efectos informativos dentro del JWT. La
   * autorización efectiva sigue operando sobre `permissions`.
   */
  resolveRoleNamesForUser(userId: number): Promise<string[]>;
}
