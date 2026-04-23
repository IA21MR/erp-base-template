/**
 * Entidad hija: FiscalSettings (parte del aggregate Organization)
 */
export interface FiscalSettingsProps {
  fiscalYearStartMonth: number; // 1–12
  taxRegime: string | null;
  economicActivity: string | null;
  notes: string | null;
}

export class FiscalSettings {
  private constructor(private props: FiscalSettingsProps) {}

  static create(props: { fiscalYearStartMonth?: number; taxRegime?: string | null; economicActivity?: string | null; notes?: string | null }): FiscalSettings {
    const month = props.fiscalYearStartMonth ?? 1;
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error('fiscalYearStartMonth debe ser un entero entre 1 y 12');
    }
    return new FiscalSettings({
      fiscalYearStartMonth: month,
      taxRegime: props.taxRegime?.trim() || null,
      economicActivity: props.economicActivity?.trim() || null,
      notes: props.notes?.trim() || null,
    });
  }

  static default(): FiscalSettings {
    return FiscalSettings.create({ fiscalYearStartMonth: 1 });
  }

  get fiscalYearStartMonth(): number { return this.props.fiscalYearStartMonth; }
  get taxRegime(): string | null { return this.props.taxRegime; }
  get economicActivity(): string | null { return this.props.economicActivity; }
  get notes(): string | null { return this.props.notes; }

  replaceAll(props: Partial<{ fiscalYearStartMonth: number; taxRegime: string | null; economicActivity: string | null; notes: string | null }>): void {
    if (props.fiscalYearStartMonth !== undefined) {
      if (!Number.isInteger(props.fiscalYearStartMonth) || props.fiscalYearStartMonth < 1 || props.fiscalYearStartMonth > 12) {
        throw new Error('fiscalYearStartMonth debe ser un entero entre 1 y 12');
      }
      this.props.fiscalYearStartMonth = props.fiscalYearStartMonth;
    }
    if (props.taxRegime !== undefined) this.props.taxRegime = props.taxRegime?.trim() || null;
    if (props.economicActivity !== undefined) this.props.economicActivity = props.economicActivity?.trim() || null;
    if (props.notes !== undefined) this.props.notes = props.notes?.trim() || null;
  }
}
