-- CreateTable
CREATE TABLE "organization_module" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "module_name" VARCHAR(100) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "enabled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_module_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_module_organization_id_module_name_key"
    ON "organization_module"("organization_id", "module_name");

-- CreateIndex
CREATE INDEX "organization_module_organization_id_idx"
    ON "organization_module"("organization_id");

-- CreateIndex
CREATE INDEX "organization_module_module_name_idx"
    ON "organization_module"("module_name");

-- AddForeignKey
ALTER TABLE "organization_module"
    ADD CONSTRAINT "organization_module_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
