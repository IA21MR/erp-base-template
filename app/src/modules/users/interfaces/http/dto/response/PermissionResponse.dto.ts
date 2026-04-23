// DTO de Response para permiso
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({ description: 'ID del permiso', example: 1 })
  id: number;

  @ApiProperty({ description: 'Código del permiso', example: 'CREATE_USER' })
  code: string;

  @ApiPropertyOptional({ description: 'Descripción del permiso', example: 'Crear usuarios del sistema' })
  description: string | null;
}
