/**
 * OrganizationsController
 * Endpoints HTTP REST del módulo Organizations.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/security/guards/JwtAuthGuard';
import { RequirePermissions } from '../../../../../shared/infrastructure/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../../../shared/infrastructure/guards/PermissionsGuard';
import { OrganizationModuleService } from '../../../../../shared/plugin-system/application/OrganizationModuleService';
import { PluginRegistry } from '../../../../../shared/plugin-system/application/PluginRegistry';
import {
  ActivateOrganizationUseCase,
  CreateOrganizationUseCase,
  DeactivateOrganizationUseCase,
  GetOrganizationByIdUseCase,
  ListOrganizationsUseCase,
  SearchOrganizationsUseCase,
  SetPrimaryOrganizationUseCase,
  UpdateBrandingSettingsUseCase,
  UpdateFiscalSettingsUseCase,
  UpdateNotificationSettingsUseCase,
  UpdateOrganizationUseCase,
  UpdateRegionalSettingsUseCase,
} from '../../../application/use-cases';
import {
  BrandingSettingsInputDto,
  CreateOrganizationRequestDto,
  FiscalSettingsInputDto,
  ListOrganizationsQueryDto,
  NotificationSettingsInputDto,
  RegionalSettingsInputDto,
  SearchOrganizationsQueryDto,
  UpdateOrganizationRequestDto,
} from '../dto/request/OrganizationRequest.dto';

@ApiTags('organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(
    private readonly createUc: CreateOrganizationUseCase,
    private readonly updateUc: UpdateOrganizationUseCase,
    private readonly activateUc: ActivateOrganizationUseCase,
    private readonly deactivateUc: DeactivateOrganizationUseCase,
    private readonly setPrimaryUc: SetPrimaryOrganizationUseCase,
    private readonly getByIdUc: GetOrganizationByIdUseCase,
    private readonly listUc: ListOrganizationsUseCase,
    private readonly searchUc: SearchOrganizationsUseCase,
    private readonly updateRegionalUc: UpdateRegionalSettingsUseCase,
    private readonly updateFiscalUc: UpdateFiscalSettingsUseCase,
    private readonly updateNotifUc: UpdateNotificationSettingsUseCase,
    private readonly updateBrandUc: UpdateBrandingSettingsUseCase,
    private readonly organizationModuleService: OrganizationModuleService,
    private readonly pluginRegistry: PluginRegistry,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_ORGANIZATION')
  @ApiOperation({ summary: 'Crear organización' })
  async create(@Body() body: CreateOrganizationRequestDto, @Request() req: any) {
    const data = await this.createUc.execute(body, req.user.id);
    return { message: 'Organización creada exitosamente', data };
  }

  @Get()
  @RequirePermissions('READ_ORGANIZATION')
  @ApiOperation({ summary: 'Listar organizaciones' })
  async list(@Query() query: ListOrganizationsQueryDto) {
    const { items, meta } = await this.listUc.execute(query);
    return { message: 'Organizaciones obtenidas exitosamente', data: items, meta };
  }

  @Get('search')
  @RequirePermissions('READ_ORGANIZATION')
  @ApiOperation({ summary: 'Buscar organizaciones' })
  async search(@Query() query: SearchOrganizationsQueryDto) {
    const { items, meta } = await this.searchUc.execute(query);
    return { message: 'Búsqueda completada', data: items, meta };
  }

  @Get('available-modules')
  @RequirePermissions('READ_ORGANIZATION')
  @ApiOperation({ summary: 'Listar módulos disponibles en el sistema' })
  async getAvailableModules() {
    const modules = this.pluginRegistry
      .getAll()
      .filter((p) => !p.isCore)
      .map((p) => ({ name: p.name, description: p.description ?? null, version: p.version ?? null }));
    return { message: 'Módulos disponibles', data: modules };
  }

  @Get('primary')
  @RequirePermissions('READ_ORGANIZATION')
  @ApiOperation({ summary: 'Obtener organización primaria' })
  async getPrimary() {
    const { items } = await this.listUc.execute({ isPrimary: true, page: 1, perPage: 1 });
    return { message: 'Organización primaria', data: items[0] ?? null };
  }

  @Get(':id')
  @RequirePermissions('READ_ORGANIZATION')
  @ApiOperation({ summary: 'Obtener organización por ID' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.getByIdUc.execute(id);
    return { message: 'Organización obtenida exitosamente', data };
  }

  @Patch(':id')
  @RequirePermissions('UPDATE_ORGANIZATION')
  @ApiOperation({ summary: 'Actualizar organización' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateOrganizationRequestDto,
    @Request() req: any,
  ) {
    const data = await this.updateUc.execute({ id, ...body }, req.user.id);
    return { message: 'Organización actualizada exitosamente', data };
  }

  @Patch(':id/activate')
  @RequirePermissions('ACTIVATE_ORGANIZATION')
  @ApiOperation({ summary: 'Activar organización' })
  async activate(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any) {
    const data = await this.activateUc.execute(id, req.user.id);
    return { message: 'Organización activada exitosamente', data };
  }

  @Patch(':id/deactivate')
  @RequirePermissions('DEACTIVATE_ORGANIZATION')
  @ApiOperation({ summary: 'Desactivar organización' })
  async deactivate(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any) {
    const data = await this.deactivateUc.execute(id, req.user.id);
    return { message: 'Organización desactivada exitosamente', data };
  }

  @Patch(':id/set-primary')
  @RequirePermissions('SET_PRIMARY_ORGANIZATION')
  @ApiOperation({ summary: 'Marcar organización como primaria' })
  async setPrimary(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any) {
    const data = await this.setPrimaryUc.execute(id, req.user.id);
    return { message: 'Organización marcada como primaria', data };
  }

  @Get(':id/settings')
  @RequirePermissions('READ_ORGANIZATION')
  @ApiOperation({ summary: 'Obtener configuración de la organización' })
  async getSettings(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.getByIdUc.execute(id);
    return { message: 'Configuración obtenida', data: data.settings };
  }

  @Patch(':id/settings/regional')
  @RequirePermissions('MANAGE_ORGANIZATION_SETTINGS')
  @ApiOperation({ summary: 'Actualizar configuración regional' })
  async updateRegional(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: RegionalSettingsInputDto,
    @Request() req: any,
  ) {
    const data = await this.updateRegionalUc.execute({ id, ...body }, req.user.id);
    return { message: 'Configuración regional actualizada', data };
  }

  @Patch(':id/settings/fiscal')
  @RequirePermissions('MANAGE_ORGANIZATION_SETTINGS')
  @ApiOperation({ summary: 'Actualizar configuración fiscal' })
  async updateFiscal(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: FiscalSettingsInputDto,
    @Request() req: any,
  ) {
    const data = await this.updateFiscalUc.execute({ id, ...body }, req.user.id);
    return { message: 'Configuración fiscal actualizada', data };
  }

  @Patch(':id/settings/notifications')
  @RequirePermissions('MANAGE_ORGANIZATION_SETTINGS')
  @ApiOperation({ summary: 'Actualizar configuración de notificaciones' })
  async updateNotifications(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: NotificationSettingsInputDto,
    @Request() req: any,
  ) {
    const data = await this.updateNotifUc.execute({ id, ...body }, req.user.id);
    return { message: 'Configuración de notificaciones actualizada', data };
  }

  @Patch(':id/settings/branding')
  @RequirePermissions('MANAGE_ORGANIZATION_SETTINGS')
  @ApiOperation({ summary: 'Actualizar branding' })
  async updateBranding(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: BrandingSettingsInputDto,
    @Request() req: any,
  ) {
    const data = await this.updateBrandUc.execute({ id, ...body }, req.user.id);
    return { message: 'Branding actualizado', data };
  }

  @Get(':id/modules')
  @RequirePermissions('READ_ORGANIZATION')
  @ApiOperation({ summary: 'Listar módulos habilitados de una organización' })
  async getModules(@Param('id', new ParseUUIDPipe()) id: string) {
    const enabled = await this.organizationModuleService.listEnabled(id);
    return { message: 'Módulos obtenidos', data: enabled };
  }

  @Put(':id/modules/:moduleName')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('MANAGE_ORGANIZATION_SETTINGS')
  @ApiOperation({ summary: 'Habilitar un módulo para una organización' })
  async enableModule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('moduleName') moduleName: string,
  ) {
    await this.organizationModuleService.enable(id, moduleName);
    return { message: `Módulo "${moduleName}" habilitado` };
  }

  @Delete(':id/modules/:moduleName')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('MANAGE_ORGANIZATION_SETTINGS')
  @ApiOperation({ summary: 'Deshabilitar un módulo para una organización' })
  async disableModule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('moduleName') moduleName: string,
  ) {
    await this.organizationModuleService.disable(id, moduleName);
    return { message: `Módulo "${moduleName}" deshabilitado` };
  }
}
