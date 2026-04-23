/**
 * Controlador HTTP de Usuarios
 *
 * Implementa los endpoints REST para la gestión de usuarios (RF-U1, RF-U2).
 * Seguridad: JWT + Permisos por endpoint.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
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
import { CreateUserUseCase } from '../../../application/use-cases/CreateUser.usecase';
import { UpdateUserUseCase } from '../../../application/use-cases/UpdateUser.usecase';
import { ActivateUserUseCase } from '../../../application/use-cases/ActivateUser.usecase';
import { DeactivateUserUseCase } from '../../../application/use-cases/DeactivateUser.usecase';
import { ListUsersUseCase } from '../../../application/use-cases/ListUsers.usecase';
import { GetUserByIdUseCase } from '../../../application/use-cases/GetUserById.usecase';
import { AssignRolesUseCase } from '../../../application/use-cases/AssignRoles.usecase';
import { SearchUsersUseCase } from '../../../application/use-cases/SearchUsers.usecase';
import { InvalidUserDataException } from '../../../domain/exceptions';
import { CreateUserRequestDto } from '../dto/request/CreateUserRequest.dto';
import { UpdateUserRequestDto } from '../dto/request/UpdateUserRequest.dto';
import { AssignRolesRequestDto } from '../dto/request/AssignRolesRequest.dto';
import { SearchUsersQueryDto } from '../dto/request/SearchUsersQuery.dto';
import { CreateUserCommand } from '../../../application/commands/CreateUserCommand';
import { UpdateUserCommand } from '../../../application/commands/UpdateUserCommand';
import { AssignRolesCommand } from '../../../application/commands/AssignRolesCommand';
import { SearchUsersCommand } from '../../../application/commands/SearchUsersCommand';
import { RequirePermissions } from '../../../../../shared/infrastructure/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../../../shared/infrastructure/guards/PermissionsGuard';
import { JwtAuthGuard } from '../../../../auth/infrastructure/security/guards/JwtAuthGuard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard) // Requiere autenticación JWT y valida permisos
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly assignRolesUseCase: AssignRolesUseCase,
    private readonly searchUsersUseCase: SearchUsersUseCase,
  ) {}

  // RF-U1: Crear usuario
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_USER')
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Crea un nuevo usuario del sistema con roles asignados.',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email duplicado' })
  async createUser(@Body() body: CreateUserRequestDto, @Request() req: any) {
    // El `organizationId` se deriva del JWT del administrador autenticado.
    // Esto garantiza que un usuario NO pueda crear usuarios en otra organización.
    const organizationId: string | null = req.user?.organizationId ?? null;
    if (!organizationId) {
      // Se lanza 400 — el DomainExceptionFilter mapea InvalidUserDataException.
      throw new InvalidUserDataException(
        'El token no contiene una organización activa',
      );
    }

    const command = new CreateUserCommand(
      body.name,
      body.email,
      body.password,
      body.roleIds,
      organizationId,
    );

    // Obtener el ID del usuario autenticado desde req.user (viene del JWT)
    const createdBy = req.user.id;

    const user = await this.createUserUseCase.execute(command, createdBy);

    return {
      message: 'Usuario creado exitosamente',
      data: {
        id: user.id,
        organizationId: user.organizationId.value,
        name: user.name,
        email: user.email.value,
        active: user.active,
        roleIds: user.roleIds,
      },
    };
  }

  // RF-U2: Listar usuarios con paginación
  @Get()
  @RequirePermissions('LIST_USERS', 'READ_USER')
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene la lista paginada de todos los usuarios con sus roles.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, enum: [30, 50, 100], example: 30 })
  @ApiResponse({ status: 200, description: 'Lista paginada de usuarios' })
  async listUsers(@Query() query: any, @Request() req: any) {
    const page = query.page ? parseInt(query.page) : 1;
    const perPage = query.perPage ? parseInt(query.perPage) : 30;
    const organizationId: string | undefined = req.user?.organizationId ?? undefined;

    const result = await this.listUsersUseCase.execute({ page, perPage, organizationId });

    return {
      message: 'Usuarios obtenidos exitosamente',
      data: result.items.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        active: user.active,
        roles: user.roles.map((role) => ({
          id: role.id,
          name: role.name,
        })),
      })),
      meta: result.meta,
    };
  }

  // RF-U2: Buscar usuarios con filtros
  @Get('search')
  @RequirePermissions('LIST_USERS', 'READ_USER')
  @ApiOperation({
    summary: 'Buscar usuarios',
    description: 'Busca usuarios con filtros opcionales: query (nombre/email), estado, rol. Soporta paginación.',
  })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'roleId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, enum: [30, 50, 100], example: 30 })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda paginados' })
  async searchUsers(@Query() query: SearchUsersQueryDto, @Request() req: any) {
    const organizationId: string | undefined = req.user?.organizationId ?? undefined;
    const command = new SearchUsersCommand(
      query.query,
      query.active,
      query.roleId,
      query.page,
      query.perPage,
      organizationId,
    );

    const result = await this.searchUsersUseCase.execute(command);

    return {
      message: 'Usuarios encontrados',
      data: result.items.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        active: user.active,
        roles: user.roles.map((role) => ({
          id: role.id,
          name: role.name,
        })),
      })),
      meta: result.meta,
    };
  }

  // RF-U2: Obtener un usuario por ID
  @Get(':id')
  @RequirePermissions('READ_USER')
  @ApiOperation({
    summary: 'Obtener usuario',
    description: 'Obtiene los detalles de un usuario por su ID.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getUser(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const callerOrgId: string | undefined = req.user?.organizationId ?? undefined;
    const user = await this.getUserByIdUseCase.execute(id, callerOrgId);

    return {
      message: 'Usuario obtenido exitosamente',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        active: user.active,
        roles: user.roles.map((role) => ({
          id: role.id,
          name: role.name,
          permissionIds: role.permissionIds,
        })),
      },
    };
  }

  // RF-U1: Actualizar usuario
  @Patch(':id')
  @RequirePermissions('UPDATE_USER')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza los datos de un usuario existente.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Email duplicado' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserRequestDto,
    @Request() req: any
  ) {
    const command = new UpdateUserCommand(body.name, body.email, body.password);

    // Obtener el ID del usuario autenticado desde req.user (viene del JWT)
    const updatedBy = req.user.id;
    const callerOrgId: string | undefined = req.user?.organizationId ?? undefined;

    const user = await this.updateUserUseCase.execute(id, command, updatedBy, callerOrgId);

    return {
      message: 'Usuario actualizado exitosamente',
      data: {
        id: user.id,
        name: user.name,
        email: user.email.value,
        active: user.active,
      },
    };
  }

  // RF-U1: Activar usuario
  @Patch(':id/activate')
  @RequirePermissions('ACTIVATE_USER')
  @ApiOperation({
    summary: 'Activar usuario',
    description: 'Activa un usuario previamente desactivado.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario activado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async activateUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    // Obtener el ID del usuario autenticado desde req.user (viene del JWT)
    const activatedBy = req.user.id;
    const callerOrgId: string | undefined = req.user?.organizationId ?? undefined;

    const user = await this.activateUserUseCase.execute(id, activatedBy, callerOrgId);

    return {
      message: 'Usuario activado exitosamente',
      data: {
        id: user.id,
        name: user.name,
        active: user.active,
      },
    };
  }

  // RF-U1: Desactivar usuario
  @Patch(':id/deactivate')
  @RequirePermissions('DEACTIVATE_USER')
  @ApiOperation({
    summary: 'Desactivar usuario',
    description: 'Desactiva un usuario activo (soft delete).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deactivateUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    // Obtener el ID del usuario autenticado desde req.user (viene del JWT)
    const deactivatedBy = req.user.id;
    const callerOrgId: string | undefined = req.user?.organizationId ?? undefined;

    const user = await this.deactivateUserUseCase.execute(id, deactivatedBy, callerOrgId);

    return {
      message: 'Usuario desactivado exitosamente',
      data: {
        id: user.id,
        name: user.name,
        active: user.active,
      },
    };
  }

  // RF-R1: Asignar roles a usuario
  @Post(':id/roles')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('ASSIGN_ROLES')
  @ApiOperation({
    summary: 'Asignar roles',
    description: 'Asigna roles a un usuario existente.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Roles asignados' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AssignRolesRequestDto,
    @Request() req: any
  ) {
    const command = new AssignRolesCommand(id, body.roleIds);

    // Obtener el ID del usuario autenticado desde req.user (viene del JWT)
    const assignedBy = req.user.id;
    const callerOrgId: string | undefined = req.user?.organizationId ?? undefined;

    const user = await this.assignRolesUseCase.execute(command, assignedBy, callerOrgId);

    return {
      message: 'Roles asignados exitosamente',
      data: {
        id: user.id,
        name: user.name,
        roleIds: user.roleIds,
      },
    };
  }
}
