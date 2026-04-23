/**
 * Helpers para E2E tests del Plugin System.
 *
 * Uso típico:
 *   import { enableModule } from './helpers/plugin-system.helpers';
 *   await enableModule(prisma, organizationId, 'contacts');
 *
 * Y agregar el header en los requests:
 *   request(app.getHttpServer())
 *     .get('/contacts')
 *     .set('x-organization-id', organizationId)
 *     .set('Authorization', `Bearer ${token}`)
 */
import { uuidv7 } from 'uuidv7';
import type { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';

export async function enableModule(
  prisma: PrismaService,
  organizationId: string,
  moduleName: string,
): Promise<void> {
  await prisma.organizationModule.upsert({
    where: { organizationId_moduleName: { organizationId, moduleName } },
    update: { enabled: true, disabledAt: null },
    create: { id: uuidv7(), organizationId, moduleName, enabled: true },
  });
}

export async function disableModule(
  prisma: PrismaService,
  organizationId: string,
  moduleName: string,
): Promise<void> {
  await prisma.organizationModule.upsert({
    where: { organizationId_moduleName: { organizationId, moduleName } },
    update: { enabled: false, disabledAt: new Date() },
    create: {
      id: uuidv7(),
      organizationId,
      moduleName,
      enabled: false,
      disabledAt: new Date(),
    },
  });
}
