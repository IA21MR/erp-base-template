/**
 * Entidad hija: RegionalSettings (parte del aggregate Organization)
 *
 * Mutaciones siempre vía el root. Aquí solo el estado + validaciones de VO.
 */
import { CurrencyCode } from '../../../../shared/domain/value-objects/CurrencyCode.vo';
import { Locale } from '../../../../shared/domain/value-objects/Locale.vo';
import { Timezone } from '../../../../shared/domain/value-objects/Timezone.vo';

export interface RegionalSettingsProps {
  timezone: Timezone;
  locale: Locale;
  currency: CurrencyCode;
  dateFormat: string;
  numberFormat: string;
  weekStart: number;
  timeFormat: string;
}

export class RegionalSettings {
  private constructor(private props: RegionalSettingsProps) {}

  static create(props: {
    timezone: string | Timezone;
    locale: string | Locale;
    currency: string | CurrencyCode;
    dateFormat?: string;
    numberFormat?: string;
    weekStart?: number;
    timeFormat?: string;
  }): RegionalSettings {
    return new RegionalSettings({
      timezone: typeof props.timezone === 'string' ? Timezone.create(props.timezone) : props.timezone,
      locale: typeof props.locale === 'string' ? Locale.create(props.locale) : props.locale,
      currency: typeof props.currency === 'string' ? CurrencyCode.create(props.currency) : props.currency,
      dateFormat: props.dateFormat ?? 'DD/MM/YYYY',
      numberFormat: props.numberFormat ?? '1.234,56',
      weekStart: props.weekStart ?? 1,
      timeFormat: props.timeFormat ?? 'HH:mm',
    });
  }

  static default(): RegionalSettings {
    return RegionalSettings.create({
      timezone: 'America/Santiago',
      locale: 'es-CL',
      currency: 'CLP',
    });
  }

  get timezone(): Timezone { return this.props.timezone; }
  get locale(): Locale { return this.props.locale; }
  get currency(): CurrencyCode { return this.props.currency; }
  get dateFormat(): string { return this.props.dateFormat; }
  get numberFormat(): string { return this.props.numberFormat; }
  get weekStart(): number { return this.props.weekStart; }
  get timeFormat(): string { return this.props.timeFormat; }

  /** Reemplaza todos los campos (solo llamado desde el root). */
  replaceAll(props: Partial<{
    timezone: string | Timezone;
    locale: string | Locale;
    currency: string | CurrencyCode;
    dateFormat: string;
    numberFormat: string;
    weekStart: number;
    timeFormat: string;
  }>): void {
    if (props.timezone !== undefined) {
      this.props.timezone = typeof props.timezone === 'string' ? Timezone.create(props.timezone) : props.timezone;
    }
    if (props.locale !== undefined) {
      this.props.locale = typeof props.locale === 'string' ? Locale.create(props.locale) : props.locale;
    }
    if (props.currency !== undefined) {
      this.props.currency = typeof props.currency === 'string' ? CurrencyCode.create(props.currency) : props.currency;
    }
    if (props.dateFormat !== undefined) this.props.dateFormat = props.dateFormat;
    if (props.numberFormat !== undefined) this.props.numberFormat = props.numberFormat;
    if (props.weekStart !== undefined) this.props.weekStart = props.weekStart;
    if (props.timeFormat !== undefined) this.props.timeFormat = props.timeFormat;
  }
}
