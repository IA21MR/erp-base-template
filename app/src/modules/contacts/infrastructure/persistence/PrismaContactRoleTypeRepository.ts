import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { ContactRoleType } from '../../domain/entities/ContactRoleType.entity';
import { ContactRoleTypeRepository } from '../../domain/repositories/ContactRoleTypeRepository.interface';
import { ContactMapper } from '../mappers/ContactMapper';

@Injectable()
export class PrismaContactRoleTypeRepository implements ContactRoleTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ContactRoleType[]> {
    const rows = await this.prisma.contactRoleType.findMany({ orderBy: { code: 'asc' } });
    return rows.map((r) => ContactMapper.roleTypeToDomain(r));
  }

  async findById(id: string): Promise<ContactRoleType | null> {
    const row = await this.prisma.contactRoleType.findUnique({ where: { id } });
    return row ? ContactMapper.roleTypeToDomain(row) : null;
  }
}
