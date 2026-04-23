// Command para crear un usuario.
// `tenantId` proviene del contexto multi-tenant del administrador autenticado
// (resuelto por el provider de TenantContext, p.ej. el módulo `organizations`).
// En proyectos core-only puede ser `null`.
export class CreateUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly roleIds: number[],
    public readonly tenantId: string | null,
  ) {}
}
