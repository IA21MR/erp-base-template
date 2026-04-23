// Command para actualizar un usuario
export class UpdateUserCommand {
  constructor(
    public readonly name?: string,
    public readonly email?: string,
    public readonly password?: string,
  ) {}
}
