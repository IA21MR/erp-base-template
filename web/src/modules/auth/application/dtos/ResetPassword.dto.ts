/**
 * DTO de entrada para restablecer contraseña
 */
export interface ResetPasswordDTO {
  email: string;
  code: string;
  newPassword: string;
}
