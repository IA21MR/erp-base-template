// DTO de Response para verificación de código
import { ApiProperty } from '@nestjs/swagger';

export class VerifyResetCodeResponseDto {
  @ApiProperty({
    description: 'Indica si el código es válido',
    example: true,
  })
  valid: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Código válido',
    required: false,
  })
  message?: string;

  constructor(valid: boolean, message?: string) {
    this.valid = valid;
    this.message = message;
  }
}
