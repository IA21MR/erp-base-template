/**
 * DomainException — shared/domain
 *
 * Clase base para todas las excepciones de dominio.
 * Asigna automáticamente `this.name` con el nombre de la clase concreta,
 * eliminando la necesidad de repetir `this.name = 'XxxException'` en cada subclase.
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
