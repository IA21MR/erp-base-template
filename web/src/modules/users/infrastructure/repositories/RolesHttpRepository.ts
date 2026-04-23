/**
 * Repositorio HTTP para Roles
 */

import { httpClient } from '@/shared/infrastructure/http/HttpClient';
import type { Role, Permission } from '../../domain/types/role.types';
import type { RoleFormData } from '../../application/validations/role.schema';
import { RoleSchema, PermissionSchema } from '../schemas/user.schemas';
import { apiWrapperSchema } from '@/shared/infrastructure/schemas/api.schemas';

export class RolesHttpRepository {
  private readonly basePath = '/roles';
  private readonly permissionsPath = '/permissions';

  async listRoles(): Promise<Role[]> {
    const response = await httpClient.get(this.basePath);
    const parsed = apiWrapperSchema(RoleSchema.array()).parse(response);

    return parsed.data.map((role) => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions,
    }));
  }

  async getRoleById(id: number): Promise<Role> {
    const response = await httpClient.get(`${this.basePath}/${id}`);
    const parsed = apiWrapperSchema(RoleSchema).parse(response);

    return {
      id: parsed.data.id,
      name: parsed.data.name,
      permissions: parsed.data.permissions,
    };
  }

  async createRole(data: RoleFormData): Promise<void> {
    await httpClient.post(this.basePath, {
      name: data.name,
      permissionIds: data.permissionIds,
    });
  }

  async updateRole(id: number, data: RoleFormData): Promise<void> {
    await httpClient.patch(`${this.basePath}/${id}`, {
      name: data.name,
      permissionIds: data.permissionIds,
    });
  }

  async deleteRole(id: number): Promise<void> {
    await httpClient.delete(`${this.basePath}/${id}`);
  }

  async listPermissions(): Promise<Permission[]> {
    const response = await httpClient.get(this.permissionsPath);
    const parsed = apiWrapperSchema(PermissionSchema.array()).parse(response);

    return parsed.data;
  }
}

export const rolesHttpRepository = new RolesHttpRepository();
