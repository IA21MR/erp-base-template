import { Injectable } from '@nestjs/common';
import { uuidv7 } from 'uuidv7';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { OrganizationModuleRepository } from '../../domain/OrganizationModuleRepository.interface';

@Injectable()
export class PrismaOrganizationModuleRepository implements OrganizationModuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async isEnabled(organizationId: string, moduleName: string): Promise<boolean> {
    const record = await this.prisma.organizationModule.findUnique({
      where: {
        organizationId_moduleName: { organizationId, moduleName },
      },
      select: { enabled: true },
    });
    return record?.enabled === true;
  }

  async listEnabled(organizationId: string): Promise<string[]> {
    const rows = await this.prisma.organizationModule.findMany({
      where: { organizationId, enabled: true },
      select: { moduleName: true },
    });
    return rows.map((r) => r.moduleName);
  }

  async enable(organizationId: string, moduleName: string): Promise<void> {
    await this.prisma.organizationModule.upsert({
      where: { organizationId_moduleName: { organizationId, moduleName } },
      update: { enabled: true, disabledAt: null },
      create: { id: uuidv7(), organizationId, moduleName, enabled: true },
    });
  }

  async disable(organizationId: string, moduleName: string): Promise<void> {
    await this.prisma.organizationModule.upsert({
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

  async enableMany(organizationId: string, moduleNames: string[]): Promise<void> {
    if (moduleNames.length === 0) return;
    await this.prisma.$transaction(
      moduleNames.map((moduleName) =>
        this.prisma.organizationModule.upsert({
          where: { organizationId_moduleName: { organizationId, moduleName } },
          update: { enabled: true, disabledAt: null },
          create: { id: uuidv7(), organizationId, moduleName, enabled: true },
        }),
      ),
    );
  }
}
