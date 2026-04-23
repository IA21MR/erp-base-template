/**
 * Tokens de inyección de dependencias - Módulo Auth
 *
 * Responsabilidad: Definir símbolos únicos para identificar providers en el contenedor IoC.
 */

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');
export const CODE_GENERATOR = Symbol('CODE_GENERATOR');
export const EMAIL_SENDER = Symbol('EMAIL_SENDER');
export const PASSWORD_RESET_REPOSITORY = Symbol('PASSWORD_RESET_REPOSITORY');
export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');
export const AUTH_CONTEXT_PROVIDER = Symbol('AUTH_CONTEXT_PROVIDER');
