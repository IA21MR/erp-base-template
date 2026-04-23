// DTO de Response para cambio de contraseña
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Contraseña actualizada exitosamente',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
