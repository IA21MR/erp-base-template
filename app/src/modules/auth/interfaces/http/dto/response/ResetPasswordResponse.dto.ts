// DTO de Response para restablecimiento de contraseña
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Contraseña actualizada exitosamente',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
