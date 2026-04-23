// Puerto (Interface) para el generador de códigos de verificación
// Abstrae la generación de códigos de 6 dígitos

export interface CodeGenerator {
  /**
   * Genera un código de verificación de 6 dígitos
   * @returns string - Código numérico de 6 dígitos (ej: "123456")
   */
  generate(): string;
}
