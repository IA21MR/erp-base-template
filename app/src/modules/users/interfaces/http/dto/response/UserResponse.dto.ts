// DTO de Response para usuario
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan@empresa.cl' })
  email: string;

  @ApiProperty({ description: 'Estado activo del usuario', example: true })
  active: boolean;
}
