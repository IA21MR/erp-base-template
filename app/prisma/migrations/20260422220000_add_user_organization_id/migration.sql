-- =====================================================================
-- Migración: Vincular User ↔ Organization (multi-tenant 1:N)
--
-- IMPORTANTE: la columna `organization_id` queda como NULLABLE en el schema
-- core (siempre presente, incluso en proyectos sin el módulo `organizations`).
-- La FK a `organization` solo se crea si la tabla existe (módulo activo).
-- =====================================================================

-- 1) Columna nullable
ALTER TABLE "user" ADD COLUMN "organization_id" UUID;

-- 2) Backfill: asignar usuarios existentes a la organización primaria, si la
--    tabla `organization` existe. En proyectos core-only (sin organizations),
--    este bloque no hace nada.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization') THEN
    EXECUTE $sql$
      UPDATE "user" u
      SET "organization_id" = COALESCE(
        (SELECT id FROM "organization" WHERE "is_primary" = true LIMIT 1),
        (SELECT id FROM "organization" ORDER BY "created_at" ASC LIMIT 1)
      )
      WHERE u."organization_id" IS NULL
    $sql$;

    -- Crear FK e índice solo si la tabla `organization` existe.
    EXECUTE 'ALTER TABLE "user"
      ADD CONSTRAINT "user_organization_id_fkey"
      FOREIGN KEY ("organization_id") REFERENCES "organization"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE';
  END IF;
END
$$;

-- 3) Índice (siempre, util incluso para queries por tenant cuando no hay FK)
CREATE INDEX "user_organization_id_idx" ON "user"("organization_id");

