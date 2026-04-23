/**
 * Orquestador de seed.
 *
 * Lee la lista de módulos activos desde src/modules.config.ts y ejecuta
 * únicamente los seeds correspondientes.
 *
 * Orden garantizado:
 *   1. Permisos core + roles (core.seed.mjs)
 *   2. Si organizations activo: permisos + organización primaria + admin user
 *   3. Si contacts activo: permisos + catálogo ContactRoleType
 *   4. (finalize) conceder TODOS los permisos al rol Administrador
 *   5. (finalize) asignar rol Administrador al usuario admin
 *   6. Si organizations activo: habilitar módulos opt-in para la organización primaria
 *
 * Uso:
 *   npm run prisma:seed
 */
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import {
  seedCore,
  grantAllPermissionsToAdmin,
  assignAdminRoleToAdminUser,
} from './seeds/core.seed.mjs';
import {
  seedOrganizationsPermissions,
  seedOrganizationsBase,
  seedOrganizationModules,
} from './seeds/organizations.seed.mjs';
import {
  seedContactsPermissions,
  seedContactsCatalog,
} from './seeds/contacts.seed.mjs';
import { resolveActiveModules } from './read-active-modules.mjs';

config();
const prisma = new PrismaClient();

async function main() {
  const activeModules = resolveActiveModules();
  console.log('🌱 Seed iniciado. Módulos activos:', activeModules.join(', '));

  // 1. Core: permisos + roles. El admin se crea aquí SOLO si organizations NO está activo,
  //    porque en modo multi-tenant User.organizationId es NOT NULL y requiere la org primero.
  await seedCore(prisma, { activeModules });

  if (!activeModules.includes('organizations')) {
    // Crear admin user sin organizationId (single-tenant).
    const bcrypt = (await import('bcrypt')).default;
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@sotek.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@sotek.com',
        passwordHash: hashedPassword,
        active: true,
      },
    });
  }

  // 2. Módulo organizations (si activo).
  let orgId = null;
  if (activeModules.includes('organizations')) {
    await seedOrganizationsPermissions(prisma);
    const res = await seedOrganizationsBase(prisma);
    orgId = res.orgId;
  }

  // 3. Módulo contacts (si activo).
  if (activeModules.includes('contacts')) {
    await seedContactsPermissions(prisma);
    await seedContactsCatalog(prisma);
  }

  // 4-5. Finalizadores core: conceder permisos al admin y asignar rol.
  await grantAllPermissionsToAdmin(prisma);
  await assignAdminRoleToAdminUser(prisma);

  // 6. Habilitar módulos opt-in para la org primaria (si aplica).
  if (orgId) {
    const optionalActive = activeModules.filter((m) => !['auth', 'users', 'organizations'].includes(m));
    await seedOrganizationModules(prisma, orgId, optionalActive);
  }

  console.log('✅ Seed completado.');
  console.log('👤 admin@sotek.com / admin123 (CAMBIAR EN PRODUCCIÓN)');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
