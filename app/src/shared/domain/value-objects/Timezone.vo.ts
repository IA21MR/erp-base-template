/**
 * Value Object: Timezone
 * IANA TZ database. Ej: America/Santiago, Europe/Madrid, UTC.
 */
export class Timezone {
  private constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Timezone no puede estar vacío');
    }
    try {
      // Intl valida si la zona existe en el runtime
      new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    } catch {
      throw new Error(`Timezone inválido: ${value}`);
    }
  }

  static create(value: string): Timezone {
    return new Timezone(value.trim());
  }

  equals(other: Timezone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
