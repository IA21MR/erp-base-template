import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { clearRateLimitCleanup } from '../src/infrastructure/guards/CustomThrottlerGuard';
import { DomainExceptionFilter } from '../src/infrastructure/filters';

describe('Users E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdUserId: number;
  let adminRoleId: number;
  let testRoleId: number;
  let uniqueEmail: string;
  let uniqueUpdatedEmail: string;

  beforeAll(async () => {
    // Configurar variable de entorno para tests
    process.env.NODE_ENV = 'test';

    // Generar emails únicos para esta ejecución de tests
    const timestamp = Date.now();
    uniqueEmail = `testuser${timestamp}@test.com`;
    uniqueUpdatedEmail = `testuserupdated${timestamp}@test.com`;

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

    // Login para obtener token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@sotek.com',
        password: 'admin123',
      });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed with status ${loginResponse.status}: ${JSON.stringify(loginResponse.body)}`);
    }

    accessToken = loginResponse.body.data.access_token;

    if (!accessToken) {
      throw new Error('Access token is undefined');
    }

    // Resolver IDs de roles desde API para no depender de IDs fijos en BD
    const rolesResponse = await request(app.getHttpServer())
      .get('/roles')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const adminRole = rolesResponse.body.data.find(
      (role: any) => role.name === 'Administrador'
    );
    const operatorRole = rolesResponse.body.data.find(
      (role: any) => role.name === 'Operario'
    );

    if (!adminRole || !operatorRole) {
      throw new Error('No se encontraron los roles base (Administrador/Operario)');
    }

    adminRoleId = adminRole.id;
    testRoleId = operatorRole.id;
  });

  afterAll(async () => {
    clearRateLimitCleanup();
    await app.close();
  });

  // ========================================
  // POST /users - Crear Usuario
  // ========================================
  describe('POST /users', () => {
    it('debería crear un usuario exitosamente', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'Test1234',
          roleIds: [testRoleId],
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test User');
      expect(response.body.data.email).toBe(uniqueEmail);
      expect(response.body.data.active).toBe(true);
      expect(response.body.data.roleIds).toContain(testRoleId);
      // Multi-tenant: el usuario creado debe estar asociado a la organización del admin (JWT)
      expect(response.body.data).toHaveProperty('organizationId');
      expect(typeof response.body.data.organizationId).toBe('string');
      expect(response.body.data.organizationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );

      // Guardar ID para tests posteriores
      createdUserId = response.body.data.id;
    });

    it('debería rechazar email duplicado (409)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Duplicate User',
          email: uniqueEmail, // Mismo email que el test anterior
          password: 'Test1234',
          roleIds: [testRoleId],
        })
        .expect(409);
    });

    it('debería validar email inválido (400)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Invalid Email User',
          email: 'invalid-email', // Email mal formado
          password: 'Test1234',
          roleIds: [testRoleId],
        })
        .expect(400);
    });

    it('debería validar contraseña corta (400)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Weak Password User',
          email: 'weakpass@test.com',
          password: 'Test1', // Menos de 8 caracteres
          roleIds: [testRoleId],
        })
        .expect(400);
    });

    it('debería validar que se asignen roles (400)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'No Roles User',
          email: 'noroles@test.com',
          password: 'Test1234',
          roleIds: [], // Sin roles
        })
        .expect(400);
    });

    it('debería rechazar sin autenticación (401)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Unauthorized User',
          email: 'unauth@test.com',
          password: 'Test1234',
          roleIds: [testRoleId],
        })
        .expect(401);
    });
  });

  // ========================================
  // GET /users - Listar Usuarios
  // ========================================
  describe('GET /users', () => {
    it('debería listar todos los usuarios', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verificar estructura de usuario
      const user = response.body.data[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('active');
      expect(user).toHaveProperty('roles');
      expect(Array.isArray(user.roles)).toBe(true);
    });

    it('debería rechazar sin autenticación (401)', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  // ========================================
  // GET /users/search - Buscar Usuarios
  // ========================================
  describe('GET /users/search', () => {
    it('debería buscar usuarios por query (nombre/email)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({ query: 'test' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería filtrar usuarios activos', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({ active: true })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      // Todos los usuarios deben estar activos
      response.body.data.forEach((user: any) => {
        expect(user.active).toBe(true);
      });
    });

    it('debería filtrar usuarios por rol', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({ roleId: testRoleId })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('debería combinar múltiples filtros', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({ query: 'test', active: true, roleId: testRoleId })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('total');
    });

    it('debería retornar array vacío si no hay coincidencias', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({ query: 'usuarioquenoexiste12345' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });
  });

  // ========================================
  // GET /users/:id - Obtener Usuario por ID
  // ========================================
  describe('GET /users/:id', () => {
    it('debería obtener un usuario por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdUserId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('roles');
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      await request(app.getHttpServer())
        .get('/users/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('debería validar ID inválido (400)', async () => {
      await request(app.getHttpServer())
        .get('/users/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  // ========================================
  // PATCH /users/:id - Actualizar Usuario
  // ========================================
  describe('PATCH /users/:id', () => {
    it('debería actualizar el nombre del usuario', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test User Updated',
        })
        .expect(200);

      expect(response.body.data.name).toBe('Test User Updated');
    });

    it('debería actualizar el email del usuario', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: uniqueUpdatedEmail,
        })
        .expect(200);

      expect(response.body.data.email).toBe(uniqueUpdatedEmail);
    });

    it('debería rechazar email duplicado al actualizar (409)', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'admin@sotek.com', // Email ya existe
        })
        .expect(409);
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      await request(app.getHttpServer())
        .patch('/users/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Non Existent',
        })
        .expect(404);
    });
  });

  // ========================================
  // POST /users/:id/roles - Asignar Roles
  // ========================================
  describe('POST /users/:id/roles', () => {
    it('debería asignar roles a un usuario', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/${createdUserId}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          roleIds: [testRoleId],
        })
        .expect(200);

      expect(response.body.data.roleIds).toContain(testRoleId);
    });

    it('debería validar que se envíen roles (400)', async () => {
      await request(app.getHttpServer())
        .post(`/users/${createdUserId}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          roleIds: [], // Array vacío
        })
        .expect(400);
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      await request(app.getHttpServer())
        .post('/users/99999/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          roleIds: [testRoleId],
        })
        .expect(404);
    });

    it('debería retornar 404 si el rol no existe', async () => {
      await request(app.getHttpServer())
        .post(`/users/${createdUserId}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          roleIds: [99999], // Rol inexistente
        })
        .expect(404);
    });
  });

  // ========================================
  // PATCH /users/:id/deactivate - Desactivar Usuario
  // ========================================
  describe('PATCH /users/:id/deactivate', () => {
    it('debería desactivar un usuario', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/deactivate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.active).toBe(false);
    });

    it('debería rechazar cuando un administrador desactiva a otro administrador (403)', async () => {
      const adminTimestamp = Date.now();
      const adminUserResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Admin Secundario',
          email: `admin-secondary-${adminTimestamp}@test.com`,
          password: 'Test1234',
          roleIds: [adminRoleId],
        })
        .expect(201);

      const secondaryAdminId = adminUserResponse.body.data.id;

      await request(app.getHttpServer())
        .patch(`/users/${secondaryAdminId}/deactivate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      await request(app.getHttpServer())
        .patch('/users/99999/deactivate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  // ========================================
  // PATCH /users/:id/activate - Activar Usuario
  // ========================================
  describe('PATCH /users/:id/activate', () => {
    it('debería activar un usuario desactivado', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/activate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.active).toBe(true);
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      await request(app.getHttpServer())
        .patch('/users/99999/activate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  // ========================================
  // Tests de Validaciones
  // ========================================
  describe('Validaciones generales', () => {
    it('debería rechazar campos adicionales no permitidos', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test User',
          email: 'extra@test.com',
          password: 'Test1234',
          roleIds: [testRoleId],
          extraField: 'no permitido', // Campo extra
        })
        .expect(400);
    });

    it('debería validar campos requeridos', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          // Falta name, email, password, roleIds
        })
        .expect(400);
    });
  });
});
