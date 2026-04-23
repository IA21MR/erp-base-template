/**
 * Entidad hija: BrandingSettings (parte del aggregate Organization)
 */
export interface BrandingSettingsProps {
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
}

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export class BrandingSettings {
  private constructor(private props: BrandingSettingsProps) {}

  static create(props: {
    primaryColor?: string | null;
    secondaryColor?: string | null;
    logoUrl?: string | null;
    faviconUrl?: string | null;
  }): BrandingSettings {
    const primaryColor = props.primaryColor?.trim() || null;
    if (primaryColor && !HEX_COLOR.test(primaryColor)) {
      throw new Error('primaryColor debe ser color HEX (#rgb o #rrggbb)');
    }
    const secondaryColor = props.secondaryColor?.trim() || null;
    if (secondaryColor && !HEX_COLOR.test(secondaryColor)) {
      throw new Error('secondaryColor debe ser color HEX (#rgb o #rrggbb)');
    }
    return new BrandingSettings({
      primaryColor,
      secondaryColor,
      logoUrl: props.logoUrl?.trim() || null,
      faviconUrl: props.faviconUrl?.trim() || null,
    });
  }

  static default(): BrandingSettings {
    return BrandingSettings.create({});
  }

  get primaryColor(): string | null { return this.props.primaryColor; }
  get secondaryColor(): string | null { return this.props.secondaryColor; }
  get logoUrl(): string | null { return this.props.logoUrl; }
  get faviconUrl(): string | null { return this.props.faviconUrl; }

  replaceAll(props: Partial<{
    primaryColor: string | null;
    secondaryColor: string | null;
    logoUrl: string | null;
    faviconUrl: string | null;
  }>): void {
    if (props.primaryColor !== undefined) {
      const pc = props.primaryColor?.trim() || null;
      if (pc && !HEX_COLOR.test(pc)) {
        throw new Error('primaryColor debe ser color HEX (#rgb o #rrggbb)');
      }
      this.props.primaryColor = pc;
    }
    if (props.secondaryColor !== undefined) {
      const sc = props.secondaryColor?.trim() || null;
      if (sc && !HEX_COLOR.test(sc)) {
        throw new Error('secondaryColor debe ser color HEX (#rgb o #rrggbb)');
      }
      this.props.secondaryColor = sc;
    }
    if (props.logoUrl !== undefined) this.props.logoUrl = props.logoUrl?.trim() || null;
    if (props.faviconUrl !== undefined) this.props.faviconUrl = props.faviconUrl?.trim() || null;
  }
}
