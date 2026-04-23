/**
 * Augmentación del Request de Express para multi-tenant.
 *
 * `request.organization` es la ÚNICA fuente de verdad para el organizationId
 * en el resto de la aplicación. Se alimenta desde el JWT (`request.user.organizationId`)
 * y jamás desde el header en entornos productivos.
 *
 * No consumir `params.organizationId`, `body.organizationId`, `query.organizationId`
 * ni headers directamente desde guards/controllers.
 */
export interface OrganizationContext {
  id: string;
}

/**
 * Forma de `request.user` tras pasar por Passport + JwtStrategy.
 * Debe mantenerse sincronizada con `AuthenticatedUser` en `JwtStrategy`.
 */
export interface AuthenticatedRequestUser {
  id: number;
  email: string;
  organizationId: string | null;
  roles: string[];
  permissions: string[];
}

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthenticatedRequestUser {}

    interface Request {
      organization?: OrganizationContext;
    }
  }
}

export {};
