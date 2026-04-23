import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { TransactionManager } from './transaction-manager';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [TransactionManager],
  exports: [TransactionManager],
})
export class DatabaseModule {}
