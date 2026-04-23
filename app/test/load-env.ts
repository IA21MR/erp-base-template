/**
 * Se ejecuta antes que cualquier test suite.
 * Carga variables de entorno para que PrismaClient
 * pueda conectarse a la base de datos en los tests E2E.
 */
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';

// Cargar primero el .env real del proyecto si existe
loadDotenv({ path: resolve(__dirname, '..', '.env') });

// Fallbacks (solo aplican si no vienen del .env)
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://erp:erp123@localhost:5433/sotek?schema=public';

process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  'dev-jwt-secret-change-me-minimum-32-chars';

process.env.NODE_ENV = 'test';
