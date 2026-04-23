-- CreateEnum
CREATE TYPE "contact_type" AS ENUM ('PERSON', 'COMPANY');

-- CreateTable
CREATE TABLE "outbox_event" (
    "id" UUID NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "aggregate_type" VARCHAR(100) NOT NULL,
    "event_type" VARCHAR(150) NOT NULL,
    "event_version" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,

    CONSTRAINT "outbox_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" UUID NOT NULL,
    "legal_name" VARCHAR(150) NOT NULL,
    "trade_name" VARCHAR(150),
    "tax_id" VARCHAR(30),
    "country_code" VARCHAR(2) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" INTEGER NOT NULL,
    "updated_by_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_address" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "region" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country_code" VARCHAR(2) NOT NULL,
    "label" VARCHAR(50),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "organization_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_settings" (
    "organization_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "organization_regional_settings" (
    "organization_id" UUID NOT NULL,
    "timezone" VARCHAR(60) NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "date_format" VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
    "number_format" VARCHAR(20) NOT NULL DEFAULT '1.234,56',

    CONSTRAINT "organization_regional_settings_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "organization_fiscal_settings" (
    "organization_id" UUID NOT NULL,
    "fiscal_year_start_month" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "organization_fiscal_settings_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "organization_notification_settings" (
    "organization_id" UUID NOT NULL,
    "email_from_name" VARCHAR(100),
    "email_reply_to" VARCHAR(255),
    "sms_enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "organization_notification_settings_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "organization_branding_settings" (
    "organization_id" UUID NOT NULL,
    "primary_color" VARCHAR(20),
    "logo_url" VARCHAR(500),
    "favicon_url" VARCHAR(500),

    CONSTRAINT "organization_branding_settings_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "contact_role_type" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contact_role_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "type" "contact_type" NOT NULL,
    "person_first_name" VARCHAR(100),
    "person_last_name" VARCHAR(100),
    "company_legal_name" VARCHAR(150),
    "company_trade_name" VARCHAR(150),
    "tax_id" VARCHAR(30),
    "country_code" VARCHAR(2),
    "notes" TEXT,
    "user_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" INTEGER NOT NULL,
    "updated_by_user_id" INTEGER NOT NULL,
    "assigned_to_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_role" (
    "id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "role_type_id" UUID NOT NULL,
    "since" DATE,
    "until" DATE,

    CONSTRAINT "contact_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_email" (
    "id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "label" VARCHAR(50),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contact_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_phone" (
    "id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "label" VARCHAR(50),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contact_phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_address" (
    "id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "region" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country_code" VARCHAR(2) NOT NULL,
    "label" VARCHAR(50),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contact_address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbox_event_processed_at_occurred_at_idx" ON "outbox_event"("processed_at", "occurred_at");

-- CreateIndex
CREATE INDEX "outbox_event_aggregate_id_aggregate_type_idx" ON "outbox_event"("aggregate_id", "aggregate_type");

-- CreateIndex
CREATE INDEX "organization_active_idx" ON "organization"("active");

-- CreateIndex
CREATE INDEX "organization_is_primary_idx" ON "organization"("is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "organization_tax_id_country_code_key" ON "organization"("tax_id", "country_code");

-- CreateIndex
CREATE INDEX "organization_address_organization_id_idx" ON "organization_address"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_role_type_code_key" ON "contact_role_type"("code");

-- CreateIndex
CREATE INDEX "contact_organization_id_type_active_idx" ON "contact"("organization_id", "type", "active");

-- CreateIndex
CREATE INDEX "contact_assigned_to_user_id_idx" ON "contact"("assigned_to_user_id");

-- CreateIndex
CREATE INDEX "contact_created_by_user_id_idx" ON "contact"("created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_organization_id_country_code_tax_id_key" ON "contact"("organization_id", "country_code", "tax_id");

-- CreateIndex
CREATE INDEX "contact_role_contact_id_idx" ON "contact_role"("contact_id");

-- CreateIndex
CREATE INDEX "contact_role_role_type_id_idx" ON "contact_role"("role_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_role_contact_id_role_type_id_key" ON "contact_role"("contact_id", "role_type_id");

-- CreateIndex
CREATE INDEX "contact_email_contact_id_idx" ON "contact_email"("contact_id");

-- CreateIndex
CREATE INDEX "contact_email_email_idx" ON "contact_email"("email");

-- CreateIndex
CREATE INDEX "contact_phone_contact_id_idx" ON "contact_phone"("contact_id");

-- CreateIndex
CREATE INDEX "contact_address_contact_id_idx" ON "contact_address"("contact_id");

-- AddForeignKey
ALTER TABLE "organization_address" ADD CONSTRAINT "organization_address_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_regional_settings" ADD CONSTRAINT "organization_regional_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization_settings"("organization_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_fiscal_settings" ADD CONSTRAINT "organization_fiscal_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization_settings"("organization_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_notification_settings" ADD CONSTRAINT "organization_notification_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization_settings"("organization_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_branding_settings" ADD CONSTRAINT "organization_branding_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization_settings"("organization_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_role" ADD CONSTRAINT "contact_role_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_role" ADD CONSTRAINT "contact_role_role_type_id_fkey" FOREIGN KEY ("role_type_id") REFERENCES "contact_role_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_email" ADD CONSTRAINT "contact_email_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_phone" ADD CONSTRAINT "contact_phone_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_address" ADD CONSTRAINT "contact_address_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
