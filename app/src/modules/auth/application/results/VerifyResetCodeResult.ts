// Result del caso de uso de verificación de código
// Indica si el código es válido o no

export class VerifyResetCodeResult {
  constructor(
    public readonly valid: boolean,
    public readonly message?: string
  ) {}
}
