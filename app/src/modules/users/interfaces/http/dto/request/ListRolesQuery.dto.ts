// DTO de Query para listar roles
import { IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListRolesQueryDto {
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

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 30,
    enum: [30, 50, 100],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'perPage debe ser un número entero' })
  @IsIn([30, 50, 100], { message: 'perPage debe ser 30, 50 o 100' })
  perPage?: 30 | 50 | 100 = 30;
}
