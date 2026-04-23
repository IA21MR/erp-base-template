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
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/security/guards/JwtAuthGuard';
import { RequirePermissions } from '../../../../../shared/infrastructure/decorators/require-permissions.decorator';
import { ModuleAccess } from '../../../../../shared/infrastructure/decorators/module-access.decorator';
import { PermissionsGuard } from '../../../../../shared/infrastructure/guards/PermissionsGuard';
import {
  ActivateContactUseCase,
  AddContactAddressUseCase,
  AddContactEmailUseCase,
  AddContactPhoneUseCase,
  AddContactRoleUseCase,
  AssignContactUseCase,
  CreateContactUseCase,
  DeactivateContactUseCase,
  GetContactByIdUseCase,
  ListContactsUseCase,
  RemoveContactAddressUseCase,
  RemoveContactEmailUseCase,
  RemoveContactPhoneUseCase,
  RemoveContactRoleUseCase,
  SearchContactsUseCase,
  SetPrimaryContactAddressUseCase,
  SetPrimaryContactEmailUseCase,
  SetPrimaryContactPhoneUseCase,
  UpdateContactAddressUseCase,
  UpdateContactEmailUseCase,
  UpdateContactPhoneUseCase,
  UpdateContactUseCase,
} from '../../../application/use-cases';
import {
  AddContactAddressRequestDto,
  AddContactEmailRequestDto,
  AddContactPhoneRequestDto,
  AddContactRoleRequestDto,
  AssignContactRequestDto,
  CreateContactRequestDto,
  ListContactsQueryDto,
  SearchContactsQueryDto,
  UpdateContactAddressRequestDto,
  UpdateContactEmailRequestDto,
  UpdateContactPhoneRequestDto,
  UpdateContactRequestDto,
} from '../dto/request/ContactRequest.dto';

@ApiTags('contacts')
@ApiBearerAuth('JWT-auth')
@Controller('contacts')
@ModuleAccess('contacts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ContactsController {
  constructor(
    private readonly createUc: CreateContactUseCase,
    private readonly updateUc: UpdateContactUseCase,
    private readonly activateUc: ActivateContactUseCase,
    private readonly deactivateUc: DeactivateContactUseCase,
    private readonly assignUc: AssignContactUseCase,
    private readonly getByIdUc: GetContactByIdUseCase,
    private readonly listUc: ListContactsUseCase,
    private readonly searchUc: SearchContactsUseCase,
    private readonly addRoleUc: AddContactRoleUseCase,
    private readonly removeRoleUc: RemoveContactRoleUseCase,
    private readonly addEmailUc: AddContactEmailUseCase,
    private readonly updateEmailUc: UpdateContactEmailUseCase,
    private readonly removeEmailUc: RemoveContactEmailUseCase,
    private readonly setPrimaryEmailUc: SetPrimaryContactEmailUseCase,
    private readonly addPhoneUc: AddContactPhoneUseCase,
    private readonly updatePhoneUc: UpdateContactPhoneUseCase,
    private readonly removePhoneUc: RemoveContactPhoneUseCase,
    private readonly setPrimaryPhoneUc: SetPrimaryContactPhoneUseCase,
    private readonly addAddressUc: AddContactAddressUseCase,
    private readonly updateAddressUc: UpdateContactAddressUseCase,
    private readonly removeAddressUc: RemoveContactAddressUseCase,
    private readonly setPrimaryAddressUc: SetPrimaryContactAddressUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('CREATE_CONTACT')
  @ApiOperation({ summary: 'Crear contacto' })
  async create(@Body() body: CreateContactRequestDto, @Request() req: any) {
    const data = await this.createUc.execute(body, req.user.id);
    return { message: 'Contacto creado exitosamente', data };
  }

  @Get()
  @RequirePermissions('LIST_CONTACTS', 'READ_CONTACT')
  @ApiOperation({ summary: 'Listar contactos' })
  async list(@Query() query: ListContactsQueryDto) {
    const { items, meta } = await this.listUc.execute(query);
    return { message: 'Contactos obtenidos exitosamente', data: items, meta };
  }

  @Get('search')
  @RequirePermissions('LIST_CONTACTS', 'READ_CONTACT')
  @ApiOperation({ summary: 'Buscar contactos' })
  async search(@Query() query: SearchContactsQueryDto) {
    const { items, meta } = await this.searchUc.execute(query);
    return { message: 'Búsqueda completada', data: items, meta };
  }

  @Get(':id')
  @RequirePermissions('READ_CONTACT')
  @ApiOperation({ summary: 'Obtener contacto por ID' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.getByIdUc.execute(id);
    return { message: 'Contacto obtenido exitosamente', data };
  }

  @Patch(':id')
  @RequirePermissions('UPDATE_CONTACT')
  @ApiOperation({ summary: 'Actualizar contacto' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateContactRequestDto,
    @Request() req: any,
  ) {
    const data = await this.updateUc.execute({ id, ...body }, req.user.id);
    return { message: 'Contacto actualizado exitosamente', data };
  }

  @Patch(':id/activate')
  @RequirePermissions('ACTIVATE_CONTACT')
  @ApiOperation({ summary: 'Activar contacto' })
  async activate(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any) {
    return { message: 'Contacto activado', data: await this.activateUc.execute(id, req.user.id) };
  }

  @Patch(':id/deactivate')
  @RequirePermissions('DEACTIVATE_CONTACT')
  @ApiOperation({ summary: 'Desactivar contacto' })
  async deactivate(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any) {
    return { message: 'Contacto desactivado', data: await this.deactivateUc.execute(id, req.user.id) };
  }

  @Patch(':id/assign')
  @RequirePermissions('ASSIGN_CONTACT')
  @ApiOperation({ summary: 'Asignar contacto a un usuario' })
  async assign(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AssignContactRequestDto,
    @Request() req: any,
  ) {
    const data = await this.assignUc.execute({ contactId: id, assignedToUserId: body.assignedToUserId }, req.user.id);
    return { message: 'Contacto asignado', data };
  }

  // ============ roles ============
  @Post(':id/roles')
  @RequirePermissions('MANAGE_CONTACT_ROLES')
  @ApiOperation({ summary: 'Asignar rol al contacto' })
  async addRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AddContactRoleRequestDto,
    @Request() req: any,
  ) {
    const data = await this.addRoleUc.execute(
      {
        contactId: id,
        roleTypeId: body.roleTypeId,
        since: body.since ? new Date(body.since) : null,
        until: body.until ? new Date(body.until) : null,
      },
      req.user.id,
    );
    return { message: 'Rol asignado', data };
  }

  @Delete(':id/roles/:roleId')
  @RequirePermissions('MANAGE_CONTACT_ROLES')
  @ApiOperation({ summary: 'Quitar rol del contacto' })
  async removeRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
    @Request() req: any,
  ) {
    const data = await this.removeRoleUc.execute({ contactId: id, roleId }, req.user.id);
    return { message: 'Rol removido', data };
  }

  // ============ emails ============
  @Post(':id/emails')
  @RequirePermissions('UPDATE_CONTACT')
  async addEmail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AddContactEmailRequestDto,
    @Request() req: any,
  ) {
    const data = await this.addEmailUc.execute({ contactId: id, ...body }, req.user.id);
    return { message: 'Email agregado', data };
  }
  @Patch(':id/emails/:emailId')
  @RequirePermissions('UPDATE_CONTACT')
  async updateEmail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('emailId', new ParseUUIDPipe()) emailId: string,
    @Body() body: UpdateContactEmailRequestDto,
    @Request() req: any,
  ) {
    const data = await this.updateEmailUc.execute({ contactId: id, emailId, ...body }, req.user.id);
    return { message: 'Email actualizado', data };
  }
  @Delete(':id/emails/:emailId')
  @RequirePermissions('UPDATE_CONTACT')
  async removeEmail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('emailId', new ParseUUIDPipe()) emailId: string,
    @Request() req: any,
  ) {
    const data = await this.removeEmailUc.execute({ contactId: id, emailId }, req.user.id);
    return { message: 'Email removido', data };
  }
  @Patch(':id/emails/:emailId/primary')
  @RequirePermissions('UPDATE_CONTACT')
  async setPrimaryEmail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('emailId', new ParseUUIDPipe()) emailId: string,
    @Request() req: any,
  ) {
    const data = await this.setPrimaryEmailUc.execute({ contactId: id, emailId }, req.user.id);
    return { message: 'Email marcado como primario', data };
  }

  // ============ phones ============
  @Post(':id/phones')
  @RequirePermissions('UPDATE_CONTACT')
  async addPhone(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AddContactPhoneRequestDto,
    @Request() req: any,
  ) {
    const data = await this.addPhoneUc.execute({ contactId: id, ...body }, req.user.id);
    return { message: 'Teléfono agregado', data };
  }
  @Patch(':id/phones/:phoneId')
  @RequirePermissions('UPDATE_CONTACT')
  async updatePhone(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('phoneId', new ParseUUIDPipe()) phoneId: string,
    @Body() body: UpdateContactPhoneRequestDto,
    @Request() req: any,
  ) {
    const data = await this.updatePhoneUc.execute({ contactId: id, phoneId, ...body }, req.user.id);
    return { message: 'Teléfono actualizado', data };
  }
  @Delete(':id/phones/:phoneId')
  @RequirePermissions('UPDATE_CONTACT')
  async removePhone(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('phoneId', new ParseUUIDPipe()) phoneId: string,
    @Request() req: any,
  ) {
    const data = await this.removePhoneUc.execute({ contactId: id, phoneId }, req.user.id);
    return { message: 'Teléfono removido', data };
  }
  @Patch(':id/phones/:phoneId/primary')
  @RequirePermissions('UPDATE_CONTACT')
  async setPrimaryPhone(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('phoneId', new ParseUUIDPipe()) phoneId: string,
    @Request() req: any,
  ) {
    const data = await this.setPrimaryPhoneUc.execute({ contactId: id, phoneId }, req.user.id);
    return { message: 'Teléfono marcado como primario', data };
  }

  // ============ addresses ============
  @Post(':id/addresses')
  @RequirePermissions('UPDATE_CONTACT')
  async addAddress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AddContactAddressRequestDto,
    @Request() req: any,
  ) {
    const data = await this.addAddressUc.execute({ contactId: id, ...body }, req.user.id);
    return { message: 'Dirección agregada', data };
  }
  @Patch(':id/addresses/:addressId')
  @RequirePermissions('UPDATE_CONTACT')
  async updateAddress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('addressId', new ParseUUIDPipe()) addressId: string,
    @Body() body: UpdateContactAddressRequestDto,
    @Request() req: any,
  ) {
    const data = await this.updateAddressUc.execute({ contactId: id, addressId, ...body }, req.user.id);
    return { message: 'Dirección actualizada', data };
  }
  @Delete(':id/addresses/:addressId')
  @RequirePermissions('UPDATE_CONTACT')
  async removeAddress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('addressId', new ParseUUIDPipe()) addressId: string,
    @Request() req: any,
  ) {
    const data = await this.removeAddressUc.execute({ contactId: id, addressId }, req.user.id);
    return { message: 'Dirección removida', data };
  }
  @Patch(':id/addresses/:addressId/primary')
  @RequirePermissions('UPDATE_CONTACT')
  async setPrimaryAddress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('addressId', new ParseUUIDPipe()) addressId: string,
    @Request() req: any,
  ) {
    const data = await this.setPrimaryAddressUc.execute({ contactId: id, addressId }, req.user.id);
    return { message: 'Dirección marcada como primaria', data };
  }
}
