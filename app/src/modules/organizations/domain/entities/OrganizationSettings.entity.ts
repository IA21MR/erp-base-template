/**
 * Entidad hija: OrganizationSettings (parte del aggregate Organization)
 *
 * Contenedor de las 4 secciones. Se modifica únicamente desde el root.
 */
import { RegionalSettings } from './RegionalSettings.entity';
import { FiscalSettings } from './FiscalSettings.entity';
import { NotificationSettings } from './NotificationSettings.entity';
import { BrandingSettings } from './BrandingSettings.entity';

export class OrganizationSettings {
  constructor(
    public readonly regional: RegionalSettings,
    public readonly fiscal: FiscalSettings,
    public readonly notifications: NotificationSettings,
    public readonly branding: BrandingSettings,
  ) {}

  static default(): OrganizationSettings {
    return new OrganizationSettings(
      RegionalSettings.default(),
      FiscalSettings.default(),
      NotificationSettings.default(),
      BrandingSettings.default(),
    );
  }
}
