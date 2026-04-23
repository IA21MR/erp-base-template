-- =====================================================================
-- Migración: Vincular User ↔ Organization (multi-tenant 1:N)
-- Estrategia segura:
--   1) Agregar columna NULLABLE
--   2) Backfill con la organización primaria (o la más antigua)
--   3) Validación defensiva
--   4) Aplicar NOT NULL + FK + índice
-- =====================================================================

-- 1) Columna nullable para permitir backfill de filas existentes
ALTER TABLE "user" ADD COLUMN "organization_id" UUID;

-- 2) Backfill: asignar usuarios existentes a la organización primaria.
--    Fallback: si no hay primaria, usa la más antigua disponible.
UPDATE "user" u
SET "organization_id" = COALESCE(
  (SELECT id FROM "organization" WHERE "is_primary" = true LIMIT 1),
  (SELECT id FROM "organization" ORDER BY "created_at" ASC LIMIT 1)
)
WHERE u."organization_id" IS NULL;

-- 3) Validación: si quedó algún usuario sin organización, abortar.
--    Esto protege bases en las que todavía no exista ninguna organización.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "user" WHERE "organization_id" IS NULL) THEN
    RAISE EXCEPTION 'No se puede aplicar la migración: existen usuarios sin organización asignada. Cree una organización primaria antes de aplicar esta migración.';
  END IF;
END
$$;

-- 4) Restricciones finales
ALTER TABLE "user" ALTER COLUMN "organization_id" SET NOT NULL;

ALTER TABLE "user"
  ADD CONSTRAINT "user_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "user_organization_id_idx" ON "user"("organization_id");
