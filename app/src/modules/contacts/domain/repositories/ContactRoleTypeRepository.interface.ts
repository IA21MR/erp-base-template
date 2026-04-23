import { ContactRoleType } from '../entities/ContactRoleType.entity';

export interface ContactRoleTypeRepository {
  findAll(): Promise<ContactRoleType[]>;
  findById(id: string): Promise<ContactRoleType | null>;
}
