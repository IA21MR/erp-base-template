/**
 * Controlador HTTP de Permisos
 *
 * Implementa el endpoint REST para listar permisos del sistema.
 * Seguridad: JWT.
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/security/guards/JwtAuthGuard';
import { ListPermissionsUseCase } from '../../../application/use-cases/ListPermissions.usecase';
import { PermissionResponseDto } from '../dto/response/PermissionResponse.dto';

@ApiTags('permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly listPermissionsUseCase: ListPermissionsUseCase) {}

  // Listar todos los permisos disponibles
  @Get()
  @ApiOperation({
    summary: 'Listar permisos',
    description: 'Obtiene todos los permisos disponibles en el sistema.',
  })
  @ApiResponse({ status: 200, description: 'Lista de permisos' })
  async listPermissions(): Promise<{
    message: string;
    data: Array<{
      id: number;
      code: string;
      description: string | null;
    }>;
  }> {
    const permissions = await this.listPermissionsUseCase.execute();

    return {
      message: 'Permisos obtenidos exitosamente',
      data: permissions.map((permission) => ({
        id: permission.id,
        code: permission.code,
        description: permission.description,
      })),
    };
  }
}
