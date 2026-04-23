// Puerto (Interface) para el servicio de hasheo de contraseñas
// Permite abstraer la implementación concreta (bcrypt, argon2, etc.)

export interface PasswordHasher {
  /**
   * Compara una contraseña en texto plano con un hash
   * @param plainPassword - Contraseña sin hashear
   * @param hashedPassword - Contraseña hasheada
   * @returns Promise<boolean> - true si coinciden, false si no
   */
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;

  /**
   * Hashea una contraseña en texto plano
   * @param plainPassword - Contraseña sin hashear
   * @returns Promise<string> - Hash de la contraseña
   */
  hash(plainPassword: string): Promise<string>;
}
