/**
 * Servicio de almacenamiento local con tipado y manejo SSR-safe
 */

export class LocalStorageService {
  /**
   * Verifica si estamos en el navegador (no en SSR)
   */
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Guarda un valor en localStorage
   */
  set<T>(key: string, value: T): void {
    if (!this.isClient()) return;

    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error guardando en localStorage: ${key}`, error);
    }
  }

  /**
   * Obtiene un valor de localStorage
   */
  get<T>(key: string): T | null {
    if (!this.isClient()) return null;

    try {
      const item = localStorage.getItem(key);
      
      // Validar que item existe y no es una cadena inválida
      if (!item || item === 'undefined' || item === 'null') {
        return null;
      }
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error leyendo de localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Elimina un valor de localStorage
   */
  remove(key: string): void {
    if (!this.isClient()) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error eliminando de localStorage: ${key}`, error);
    }
  }

  /**
   * Limpia todo el localStorage
   */
  clear(): void {
    if (!this.isClient()) return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error limpiando localStorage', error);
    }
  }

  /**
   * Obtiene el token de acceso del localStorage
   */
  static getAccessToken(): string | null {
    const instance = new LocalStorageService();
    return instance.get<string>('access_token');
  }

  /**
   * Guarda el token de acceso en el localStorage
   */
  static setAccessToken(token: string): void {
    const instance = new LocalStorageService();
    instance.set('access_token', token);
  }

  /**
   * Elimina el token de acceso del localStorage
   */
  static removeAccessToken(): void {
    const instance = new LocalStorageService();
    instance.remove('access_token');
  }
}

// Exportar instancia singleton
export const localStorageService = new LocalStorageService();
