import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/security/guards/JwtAuthGuard';
import { RequirePermissions } from '../../../../../shared/infrastructure/decorators/require-permissions.decorator';
import { ModuleAccess } from '../../../../../shared/infrastructure/decorators/module-access.decorator';
import { PermissionsGuard } from '../../../../../shared/infrastructure/guards/PermissionsGuard';
import { ListContactRoleTypesUseCase } from '../../../application/use-cases';

@ApiTags('contact-role-types')
@ApiBearerAuth('JWT-auth')
@Controller('contact-role-types')
@ModuleAccess('contacts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ContactRoleTypesController {
  constructor(private readonly listUc: ListContactRoleTypesUseCase) {}

  @Get()
  @RequirePermissions('VIEW_CONTACT_ROLE_TYPES')
  @ApiOperation({ summary: 'Listar catálogo de tipos de rol de contacto' })
  async list() {
    const data = await this.listUc.execute();
    return { message: 'Tipos de rol obtenidos', data };
  }
}
