// DTO de Request para verificar código de restablecimiento
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyResetCodeRequestDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'admin@sistema.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Código de verificación de 6 dígitos recibido por email',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  @IsNotEmpty({ message: 'El código es requerido' })
  code: string;
}
