// Result del caso de uso de restablecimiento de contraseña
// Indica el resultado de la operación

export class ResetPasswordResult {
  constructor(
    public readonly success: boolean,
    public readonly message: string
  ) {}
}
