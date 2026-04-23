/**
 * Repositorio HTTP para usuarios
 */

import { httpClient } from '@/shared/infrastructure';
import type { User } from '../../domain/types';
import type { UserFormData } from '../../application/validations/user.schema';
import {
  UserApiResponseSchema,
  UserSearchResponseSchema,
} from '../schemas/user.schemas';

export class UsersHttpRepository {
  private readonly basePath = '/users';

  async getAll(): Promise<User[]> {
    const response = await httpClient.get(this.basePath);
    const parsed = UserApiResponseSchema.array().parse((response as any).data);
    
    return parsed.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      active: user.active,
      roles: user.roles ?? [],
    }));
  }

  async search(params: {
    query?: string;
    active?: boolean;
    roleId?: number;
    page?: number;
    perPage?: number;
  }): Promise<{ items: User[]; meta: { total: number; page: number; perPage: number; totalPages: number } }> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('query', params.query);
    if (params.active !== undefined) searchParams.set('active', params.active.toString());
    if (params.roleId) searchParams.set('roleId', params.roleId.toString());
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('perPage', params.perPage.toString());

    const query = searchParams.toString();
    const url = `${this.basePath}/search${query ? `?${query}` : ''}`;
    const response = await httpClient.get(url);
    const parsed = UserSearchResponseSchema.parse(response);

    return {
      items: parsed.data.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        active: user.active,
        roles: user.roles ?? [],
      })),
      meta: parsed.meta ?? { total: 0, page: 1, perPage: 30, totalPages: 1 },
    };
  }

  async getById(id: number): Promise<User> {
    const response = await httpClient.get(`${this.basePath}/${id}`);
    const parsed = UserApiResponseSchema.parse((response as any).data);
    
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      active: parsed.active,
      roles: parsed.roles ?? [],
    };
  }

  async create(data: UserFormData): Promise<User> {
    const response = await httpClient.post(
      this.basePath,
      {
        name: data.name,
        email: data.email,
        password: data.password,
        roleIds: data.roleIds,
      }
    );
    const parsed = UserApiResponseSchema.parse((response as any).data);
    
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      active: parsed.active,
      roles: parsed.roles ?? [],
    };
  }

  async update(id: number, data: UserFormData): Promise<User> {
    const payload: Record<string, unknown> = {
      name: data.name,
      email: data.email,
    };

    // Solo incluir password si se proporciona
    if (data.password && data.password.length > 0) {
      payload.password = data.password;
    }

    const response = await httpClient.patch(
      `${this.basePath}/${id}`,
      payload
    );
    const parsed = UserApiResponseSchema.parse((response as any).data);
    
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      active: parsed.active,
      roles: parsed.roles ?? [],
    };
  }

  async assignRoles(id: number, roleIds: number[]): Promise<void> {
    await httpClient.post(
      `${this.basePath}/${id}/roles`,
      { roleIds }
    );
  }

  async activate(id: number): Promise<void> {
    await httpClient.patch(
      `${this.basePath}/${id}/activate`,
      {}
    );
  }

  async deactivate(id: number): Promise<void> {
    await httpClient.patch(
      `${this.basePath}/${id}/deactivate`,
      {}
    );
  }
}

export const usersRepository = new UsersHttpRepository();
