// Result del caso de uso de cambio de contraseña

export class ChangePasswordResult {
  constructor(
    public readonly success: boolean,
    public readonly message: string,
  ) {}
}
