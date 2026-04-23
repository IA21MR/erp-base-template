-- AlterTable: Organization — add website
ALTER TABLE "organization" ADD COLUMN "website" VARCHAR(500);

-- AlterTable: OrganizationRegionalSettings — add week_start, time_format
ALTER TABLE "organization_regional_settings" ADD COLUMN "week_start" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "organization_regional_settings" ADD COLUMN "time_format" VARCHAR(20) NOT NULL DEFAULT 'HH:mm';

-- AlterTable: OrganizationFiscalSettings — add tax_regime, economic_activity, notes
ALTER TABLE "organization_fiscal_settings" ADD COLUMN "tax_regime" VARCHAR(100);
ALTER TABLE "organization_fiscal_settings" ADD COLUMN "economic_activity" VARCHAR(200);
ALTER TABLE "organization_fiscal_settings" ADD COLUMN "notes" TEXT;

-- AlterTable: OrganizationNotificationSettings — add enable_email
ALTER TABLE "organization_notification_settings" ADD COLUMN "enable_email" BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable: OrganizationBrandingSettings — add secondary_color
ALTER TABLE "organization_branding_settings" ADD COLUMN "secondary_color" VARCHAR(20);
