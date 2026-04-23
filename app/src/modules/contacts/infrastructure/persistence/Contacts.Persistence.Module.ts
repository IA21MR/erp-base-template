import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../infrastructure/database/prisma/prisma.module';
import { CONTACT_REPOSITORY, CONTACT_ROLE_TYPE_REPOSITORY } from '../../Contacts.Tokens';
import { PrismaContactRepository } from './PrismaContactRepository';
import { PrismaContactRoleTypeRepository } from './PrismaContactRoleTypeRepository';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: CONTACT_REPOSITORY, useClass: PrismaContactRepository },
    { provide: CONTACT_ROLE_TYPE_REPOSITORY, useClass: PrismaContactRoleTypeRepository },
  ],
  exports: [CONTACT_REPOSITORY, CONTACT_ROLE_TYPE_REPOSITORY],
})
export class ContactsPersistenceModule {}
