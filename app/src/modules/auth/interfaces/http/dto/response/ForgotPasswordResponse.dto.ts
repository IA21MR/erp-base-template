// DTO de Response para solicitud de restablecimiento de contraseña
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Si el correo existe, se enviará un código de verificación.',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
