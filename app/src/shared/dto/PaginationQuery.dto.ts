/**
 * PaginationQueryDto — shared/dto
 *
 * DTO base con el campo `page` reutilizable en todos los Search Query DTOs.
 * Cada módulo extiende esta clase y define su propio `perPage` con las
 * restricciones específicas que necesite (valores permitidos, default, etc.).
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero' })
  @Min(1, { message: 'page debe ser al menos 1' })
  page?: number = 1;
}
