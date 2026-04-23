// Command para crear un usuario.
// `organizationId` proviene del contexto multi-tenant del administrador autenticado (JWT).
export class CreateUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly roleIds: number[],
    public readonly organizationId: string,
  ) {}
}
