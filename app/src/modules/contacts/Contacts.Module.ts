import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { PermissionsGuard } from '../../shared/infrastructure/guards/PermissionsGuard';
import { ContactsPersistenceModule } from './infrastructure/persistence/Contacts.Persistence.Module';
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
  ListContactRoleTypesUseCase,
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
} from './application/use-cases';
import { ContactsController } from './interfaces/http/controllers/Contacts.Controller';
import { ContactRoleTypesController } from './interfaces/http/controllers/ContactRoleTypes.Controller';

@Module({
  imports: [PrismaModule, ContactsPersistenceModule],
  controllers: [ContactsController, ContactRoleTypesController],
  providers: [
    CreateContactUseCase,
    UpdateContactUseCase,
    ActivateContactUseCase,
    DeactivateContactUseCase,
    AssignContactUseCase,
    GetContactByIdUseCase,
    ListContactsUseCase,
    SearchContactsUseCase,
    ListContactRoleTypesUseCase,
    AddContactRoleUseCase,
    RemoveContactRoleUseCase,
    AddContactEmailUseCase,
    UpdateContactEmailUseCase,
    RemoveContactEmailUseCase,
    SetPrimaryContactEmailUseCase,
    AddContactPhoneUseCase,
    UpdateContactPhoneUseCase,
    RemoveContactPhoneUseCase,
    SetPrimaryContactPhoneUseCase,
    AddContactAddressUseCase,
    UpdateContactAddressUseCase,
    RemoveContactAddressUseCase,
    SetPrimaryContactAddressUseCase,
    PermissionsGuard,
  ],
  exports: [
    CreateContactUseCase,
    UpdateContactUseCase,
    GetContactByIdUseCase,
    ListContactsUseCase,
  ],
})
export class ContactsModule {}
