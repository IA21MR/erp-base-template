// Seed del módulo opcional `contacts`.
// Siembra permisos de contacts + catálogo de ContactRoleType (sistema).
import { uuidv7 } from 'uuidv7';
import { CONTACTS_PERMISSIONS } from '../permissions/contacts.mjs';

const SYSTEM_CONTACT_ROLE_TYPES = [
  { code: 'CUSTOMER', label: 'Cliente' },
  { code: 'SUPPLIER', label: 'Proveedor' },
  { code: 'EMPLOYEE', label: 'Empleado' },
  { code: 'PROSPECT', label: 'Prospecto' },
  { code: 'PARTNER', label: 'Socio / Partner' },
  { code: 'OTHER', label: 'Otro' },
];

export async function seedContactsPermissions(prisma) {
  console.log('🌱 [contacts] Creando permisos...');
  for (const permission of CONTACTS_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { description: permission.description },
      create: permission,
    });
  }
}

export async function seedContactsCatalog(prisma) {
  console.log('🏷️  [contacts] Creando tipos de rol (sistema)...');
  for (const rt of SYSTEM_CONTACT_ROLE_TYPES) {
    await prisma.contactRoleType.upsert({
      where: { code: rt.code },
      update: { label: rt.label, isSystem: true },
      create: { id: uuidv7(), code: rt.code, label: rt.label, isSystem: true },
    });
  }
}
