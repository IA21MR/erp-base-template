import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { clearRateLimitCleanup } from '../src/infrastructure/guards/CustomThrottlerGuard';
import { DomainExceptionFilter } from '../src/infrastructure/filters';

describe('Roles E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let testRoleId: number;
  let permissionIds: number[] = [];

  beforeAll(async () => {
    // Configurar variable de entorno para tests
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    // Login para obtener token de admin
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'emailActualizado@sotek.com',
        password: 'admin123',
      })
      .expect(200);

    accessToken = loginResponse.body.data.access_token;

    // Obtener permisos disponibles para usar en los tests
    const permissionsResponse = await request(app.getHttpServer())
      .get('/permissions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    permissionIds = permissionsResponse.body.data
      .slice(0, 3)
      .map((p: any) => p.id);
  });

  afterAll(async () => {
    clearRateLimitCleanup();
    await app.close();
  });

  describe('POST /roles', () => {
    it('debería crear un rol con permisos válidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Test Role ${Date.now()}`,
          permissionIds: permissionIds,
        })
        .expect(201);

      expect(response.body.message).toBe('Rol creado exitosamente');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('permissionIds');
      expect(Array.isArray(response.body.data.permissionIds)).toBe(true);

      // Guardar para otros tests
      testRoleId = response.body.data.id;
    });

    it('debería rechazar crear rol con nombre duplicado (409)', async () => {
      const roleName = `Duplicate Role ${Date.now()}`;

      // Crear primer rol
      await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: roleName,
          permissionIds: permissionIds,
        })
        .expect(201);

      // Intentar crear rol duplicado
      return request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: roleName,
          permissionIds: permissionIds,
        })
        .expect(409);
    });

    it('debería rechazar nombre inválido (400)', () => {
      return request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '', // nombre vacío
          permissionIds: permissionIds,
        })
        .expect(400);
    });

    it('debería rechazar permisos inválidos (404)', () => {
      return request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Test Role ${Date.now()}`,
          permissionIds: [99999], // ID inexistente
        })
        .expect(404);
    });

    it('debería rechazar sin autenticación (401)', () => {
      return request(app.getHttpServer())
        .post('/roles')
        .send({
          name: `Test Role ${Date.now()}`,
          permissionIds: permissionIds,
        })
        .expect(401);
    });
  });

  describe('GET /roles', () => {
    it('debería listar todos los roles', async () => {
      const response = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Roles obtenidos exitosamente');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('debería verificar estructura de respuesta', async () => {
      const response = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const firstRole = response.body.data[0];
      expect(firstRole).toHaveProperty('id');
      expect(firstRole).toHaveProperty('name');
      expect(firstRole).toHaveProperty('permissions');
      expect(Array.isArray(firstRole.permissions)).toBe(true);

      if (firstRole.permissions.length > 0) {
        const firstPermission = firstRole.permissions[0];
        expect(firstPermission).toHaveProperty('id');
        expect(firstPermission).toHaveProperty('code');
        expect(firstPermission).toHaveProperty('description');
      }
    });

    it('debería rechazar sin autenticación (401)', () => {
      return request(app.getHttpServer()).get('/roles').expect(401);
    });
  });

  describe('GET /roles/:id', () => {
    it('debería obtener un rol existente con sus permisos', async () => {
      const response = await request(app.getHttpServer())
        .get(`/roles/${testRoleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Rol obtenido exitosamente');
      expect(response.body.data).toHaveProperty('id', testRoleId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('permissions');
      expect(Array.isArray(response.body.data.permissions)).toBe(true);
    });

    it('debería retornar 404 con ID inexistente', () => {
      return request(app.getHttpServer())
        .get('/roles/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('debería retornar 400 con ID inválido', () => {
      return request(app.getHttpServer())
        .get('/roles/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('debería rechazar sin autenticación (401)', () => {
      return request(app.getHttpServer()).get(`/roles/${testRoleId}`).expect(401);
    });
  });

  describe('PATCH /roles/:id', () => {
    it('debería actualizar nombre y permisos de un rol', async () => {
      const newName = `Updated Role ${Date.now()}`;
      const newPermissionIds = permissionIds.slice(0, 2);

      const response = await request(app.getHttpServer())
        .patch(`/roles/${testRoleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: newName,
          permissionIds: newPermissionIds,
        })
        .expect(200);

      expect(response.body.message).toBe('Rol actualizado exitosamente');
      expect(response.body.data).toHaveProperty('id', testRoleId);
      expect(response.body.data).toHaveProperty('name', newName);
      expect(response.body.data).toHaveProperty('permissionIds');
    });

    it('debería retornar 404 con ID inexistente', () => {
      return request(app.getHttpServer())
        .patch('/roles/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Updated Role ${Date.now()}`,
          permissionIds: permissionIds,
        })
        .expect(404);
    });

    it('debería rechazar nombre duplicado con otro rol (409)', async () => {
      // Crear un nuevo rol
      const existingRoleName = `Existing Role ${Date.now()}`;
      await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: existingRoleName,
          permissionIds: permissionIds,
        })
        .expect(201);

      // Intentar actualizar testRoleId con el nombre existente
      return request(app.getHttpServer())
        .patch(`/roles/${testRoleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: existingRoleName,
          permissionIds: permissionIds,
        })
        .expect(409);
    });
  });

  describe('DELETE /roles/:id', () => {
    it('debería eliminar un rol sin usuarios asignados', async () => {
      // Crear un rol temporal para eliminar
      const createResponse = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `To Delete Role ${Date.now()}`,
          permissionIds: permissionIds,
        })
        .expect(201);

      const roleToDeleteId = createResponse.body.data.id;

      // Eliminar el rol
      const response = await request(app.getHttpServer())
        .delete(`/roles/${roleToDeleteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Rol eliminado exitosamente');

      // Verificar que ya no existe
      await request(app.getHttpServer())
        .get(`/roles/${roleToDeleteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('debería rechazar eliminar rol con usuarios asignados (409)', async () => {
      // El rol "Administrador" (ID 1) tiene usuarios asignados
      return request(app.getHttpServer())
        .delete('/roles/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(409);
    });
  });
});
