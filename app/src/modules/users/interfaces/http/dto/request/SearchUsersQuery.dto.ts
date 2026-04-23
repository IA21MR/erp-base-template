// DTO de Request Query para búsqueda de usuarios
import { IsOptional, IsString, IsBoolean, IsNumber, IsInt, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../../../../shared/dto';

export class SearchUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Texto a buscar en nombre o email del usuario',
    example: 'juan',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo/inactivo',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de rol',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber()
  roleId?: number;

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
