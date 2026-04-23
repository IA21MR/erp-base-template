/**
 * Controlador HTTP de Roles
 *
 * Implementa los endpoints REST para la gestión de roles (RF-R1, RF-R3).
 * Seguridad: JWT + Permisos por endpoint.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/security/guards/JwtAuthGuard';
import { CreateRoleUseCase } from '../../../application/use-cases/CreateRole.usecase';
import { UpdateRoleUseCase } from '../../../application/use-cases/UpdateRole.usecase';
import { DeleteRoleUseCase } from '../../../application/use-cases/DeleteRole.usecase';
import { ListRolesUseCase } from '../../../application/use-cases/ListRoles.usecase';
import { GetRoleByIdUseCase } from '../../../application/use-cases/GetRoleById.usecase';
import { CreateRoleRequestDto } from '../dto/request/CreateRoleRequest.dto';
import { UpdateRoleRequestDto } from '../dto/request/UpdateRoleRequest.dto';
import { CreateRoleCommand } from '../../../application/commands/CreateRoleCommand';
import { UpdateRoleCommand } from '../../../application/commands/UpdateRoleCommand';
import { RequirePermissions } from '../../../../../shared/infrastructure/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../../../shared/infrastructure/guards/PermissionsGuard';

@ApiTags('roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase
  ) {}

  // RF-R3: Crear rol
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_ROLE')
  @ApiOperation({
    summary: 'Crear rol',
    description: 'Crea un nuevo rol con permisos asignados.',
  })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createRole(@Body() body: CreateRoleRequestDto) {
    const command = new CreateRoleCommand(body.name, body.permissionIds);

    const role = await this.createRoleUseCase.execute(command);

    return {
      message: 'Rol creado exitosamente',
      data: {
        id: role.id,
        name: role.name,
        permissionIds: role.permissionIds,
      },
    };
  }

  // Listar todos los roles
  @Get()
  @RequirePermissions('READ_ROLE')
  @ApiOperation({
    summary: 'Listar roles',
    description: 'Obtiene la lista paginada de todos los roles con sus permisos.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, enum: [30, 50, 100], example: 30 })
  @ApiResponse({ status: 200, description: 'Lista paginada de roles' })
  async listRoles(@Query() query: any) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const perPage = query.perPage ? parseInt(query.perPage, 10) : 30;

    const result = await this.listRolesUseCase.execute(page, perPage);

    return {
      message: 'Roles obtenidos exitosamente',
      data: result.items.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions.map((permission) => ({
          id: permission.id,
          code: permission.code,
          description: permission.description,
        })),
      })),
      meta: result.meta,
    };
  }

  // Obtener rol por ID
  @Get(':id')
  @RequirePermissions('READ_ROLE')
  @ApiOperation({
    summary: 'Obtener rol por ID',
    description: 'Obtiene un rol específico con sus permisos.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Rol obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async getRoleById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getRoleByIdUseCase.execute(id);

    return {
      message: 'Rol obtenido exitosamente',
      data: {
        id: result.role.id,
        name: result.role.name,
        permissions: result.permissions.map((permission) => ({
          id: permission.id,
          code: permission.code,
          description: permission.description,
        })),
      },
    };
  }

  // RF-R3: Actualizar rol
  @Patch(':id')
  @RequirePermissions('UPDATE_ROLE')
  @ApiOperation({
    summary: 'Actualizar rol',
    description: 'Actualiza un rol existente.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Rol actualizado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRoleRequestDto
  ) {
    const command = new UpdateRoleCommand(body.name, body.permissionIds);

    const role = await this.updateRoleUseCase.execute(id, command);

    return {
      message: 'Rol actualizado exitosamente',
      data: {
        id: role.id,
        name: role.name,
        permissionIds: role.permissionIds,
      },
    };
  }

  // RF-R3: Eliminar rol
  @Delete(':id')
  @RequirePermissions('DELETE_ROLE')
  @ApiOperation({
    summary: 'Eliminar rol',
    description: 'Elimina un rol existente.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Rol eliminado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 409, description: 'Rol asignado a usuarios' })
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    await this.deleteRoleUseCase.execute(id);

    return {
      message: 'Rol eliminado exitosamente',
    };
  }
}
