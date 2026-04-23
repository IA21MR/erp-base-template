/**
 * Módulo principal de Users (UsersModule)
 *
 * Responsabilidad: Configurar inyección de dependencias para el módulo de usuarios
 * siguiendo arquitectura hexagonal (Domain-Driven Design).
 *
 * Estructura:
 * - Persistence: Repositorios con Prisma
 * - Use Cases: Lógica de aplicación
 * - Controllers: Endpoints HTTP
 */

import { Module } from '@nestjs/common';

// Infrastructure
import { UsersPersistenceModule } from './infrastructure/persistence/Users.Persistence.Module';
import { OrganizationsPersistenceModule } from '../organizations/infrastructure/persistence/Organizations.Persistence.Module';
import { PermissionsGuard } from '../../shared/infrastructure/guards/PermissionsGuard';

// Use Cases
import { CreateUserUseCase } from './application/use-cases/CreateUser.usecase';
import { UpdateUserUseCase } from './application/use-cases/UpdateUser.usecase';
import { ActivateUserUseCase } from './application/use-cases/ActivateUser.usecase';
import { DeactivateUserUseCase } from './application/use-cases/DeactivateUser.usecase';
import { ListUsersUseCase } from './application/use-cases/ListUsers.usecase';
import { GetUserByIdUseCase } from './application/use-cases/GetUserById.usecase';
import { AssignRolesUseCase } from './application/use-cases/AssignRoles.usecase';
import { SearchUsersUseCase } from './application/use-cases/SearchUsers.usecase';
import { CreateRoleUseCase } from './application/use-cases/CreateRole.usecase';
import { UpdateRoleUseCase } from './application/use-cases/UpdateRole.usecase';
import { DeleteRoleUseCase } from './application/use-cases/DeleteRole.usecase';
import { ListRolesUseCase } from './application/use-cases/ListRoles.usecase';
import { GetRoleByIdUseCase } from './application/use-cases/GetRoleById.usecase';
import { ListPermissionsUseCase } from './application/use-cases/ListPermissions.usecase';

// Controllers
import { UsersController } from './interfaces/http/controllers/users.controller';
import { RolesController } from './interfaces/http/controllers/roles.controller';
import { PermissionsController } from './interfaces/http/controllers/permissions.controller';

@Module({
  imports: [UsersPersistenceModule, OrganizationsPersistenceModule],
  controllers: [UsersController, RolesController, PermissionsController],
  providers: [
    // Use Cases - Users
    CreateUserUseCase,
    UpdateUserUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    ListUsersUseCase,
    GetUserByIdUseCase,
    AssignRolesUseCase,
    SearchUsersUseCase,

    // Use Cases - Roles
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    ListRolesUseCase,
    GetRoleByIdUseCase,

    // Use Cases - Permissions
    ListPermissionsUseCase,

    // Guards
    PermissionsGuard,
  ],
  exports: [
    CreateUserUseCase,
    UpdateUserUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    ListUsersUseCase,
    GetUserByIdUseCase,
    AssignRolesUseCase,
    SearchUsersUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    ListRolesUseCase,
    GetRoleByIdUseCase,
    ListPermissionsUseCase,
  ],
})
export class UsersModule {}
