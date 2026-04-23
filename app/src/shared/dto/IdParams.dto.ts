/**
 * IdParamsDto — shared/dto
 *
 * DTO base para parámetros de ruta que requieren un ID numérico.
 * Los módulos pueden extenderlo o usarlo directamente.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class IdParamsDto {
  @ApiProperty({
    description: 'ID del recurso',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'El ID debe ser un número entero' })
  @Min(1, { message: 'El ID debe ser mayor a 0' })
  id: number;
}
