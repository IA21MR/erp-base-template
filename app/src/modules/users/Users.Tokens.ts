/**
 * Tokens de inyección de dependencias - Módulo Users
 *
 * Responsabilidad: Definir símbolos únicos para identificar providers en el contenedor IoC.
 *
 * Uso: @Inject(USER_REPOSITORY) private readonly repo: UserRepository
 */

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');
export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');
