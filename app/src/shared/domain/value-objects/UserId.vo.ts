/**
 * Value Object: UserId
 *
 * Wrapper tipado sobre `number` (el User actual usa autoincrement Int).
 * Se abstrae detrás de un VO para permitir migración futura a UUID sin romper consumidores.
 */
export class UserId {
  private constructor(public readonly value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('UserId debe ser un entero positivo');
    }
  }

  static create(value: number): UserId {
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}
