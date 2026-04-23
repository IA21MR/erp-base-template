/**
 * Cliente HTTP compartido para todas las peticiones de la aplicación
 * Proporciona una interfaz unificada basada en fetch con configuración común
 */

import { localStorageService } from '../storage/LocalStorage.service';

/**
 * Tipos genéricos para respuestas de la API
 */
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

/**
 * Opciones de configuración para las peticiones
 */
export interface RequestOptions extends RequestInit {
  token?: string;
  skipAuthRefresh?: boolean; // Para evitar loops infinitos en refresh
}

/**
 * Cliente HTTP basado en fetch con manejo de errores y headers comunes
 */
class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  /**
   * Agrega un suscriptor para recibir el nuevo token cuando se refresque
   */
  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notifica a todos los suscriptores con el nuevo token
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Intenta refrescar el access token
   */
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorageService.get<string>('refresh_token');
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      // El backend devuelve snake_case (access_token, refresh_token)
      const newAccessToken = data.data.access_token;
      const newRefreshToken = data.data.refresh_token;

      // Guardar nuevos tokens
      localStorageService.set('access_token', newAccessToken);
      localStorageService.set('refresh_token', newRefreshToken);

      return newAccessToken;
    } catch (error) {
      // Si falla el refresh, limpiar tokens y redirigir a login
      localStorageService.remove('access_token');
      localStorageService.remove('refresh_token');
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return null;
    }
  }

  /**
   * Construye los headers comunes para todas las peticiones
   */
  private getHeaders(options?: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar token de autenticación
    // 1. Si se proporciona en options, usar ese
    // 2. Si no, intentar obtener del localStorage
    const token = options?.token || localStorageService.get<string>('access_token');
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Maneja los errores de las respuestas HTTP con soporte para refresh token
   */
  private async handleResponse<T>(
    response: Response,
    url: string,
    options?: RequestOptions,
    retryRequest?: () => Promise<Response>
  ): Promise<T> {
    // Si es 401 y no es una petición de refresh, intentar refrescar token
    if (response.status === 401 && !options?.skipAuthRefresh && !url.includes('/auth/refresh')) {
      if (this.isRefreshing) {
        // Si ya está refrescando, esperar el resultado
        return new Promise((resolve, reject) => {
          this.subscribeTokenRefresh(async (token) => {
            if (!retryRequest) {
              reject(new Error('No retry function available'));
              return;
            }

            try {
              const newResponse = await retryRequest();
              const result = await this.handleResponse<T>(newResponse, url, { ...options, skipAuthRefresh: true });
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
        });
      }

      this.isRefreshing = true;

      try {
        const newToken = await this.refreshAccessToken();
        
        if (newToken && retryRequest) {
          this.onTokenRefreshed(newToken);
          this.isRefreshing = false;
          
          // Reintentar la petición original con el nuevo token
          const newResponse = await retryRequest();
          return this.handleResponse<T>(newResponse, url, { ...options, skipAuthRefresh: true });
        }
      } catch (error) {
        this.isRefreshing = false;
        throw error;
      }

      this.isRefreshing = false;
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: this.getErrorMessage(response.status),
        statusCode: response.status,
      }));

      throw new Error(error.message || `Error ${response.status}`);
    }

    // Respuestas sin cuerpo (204 No Content o Content-Length: 0)
    const contentLength = response.headers.get('content-length');
    if (response.status === 204 || contentLength === '0') {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * Genera mensajes de error descriptivos según el código de estado
   */
  private getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Datos inválidos. Verifica la información ingresada.';
      case 401:
        return 'Credenciales incorrectas. Verifica tu email y contraseña.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 429:
        return 'Demasiados intentos. Espera un momento e intenta de nuevo.';
      case 500:
        return 'Error interno del servidor. Intenta más tarde.';
      case 503:
        return 'Servicio no disponible. El servidor está temporalmente fuera de línea.';
      default:
        return 'Error en la comunicación con el servidor.';
    }
  }

  /**
   * Petición GET
   */
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    const makeRequest = () => fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers: this.getHeaders(options),
      ...options,
    });

    try {
      const response = await makeRequest();
      return this.handleResponse<T>(response, url, options, makeRequest);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar con el servidor. Verifica que el backend esté corriendo.');
      }
      throw error;
    }
  }

  /**
   * Petición POST
   */
  async post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const makeRequest = () => fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: this.getHeaders(options),
      body: JSON.stringify(data),
      ...options,
    });

    try {
      const response = await makeRequest();
      return this.handleResponse<T>(response, url, options, makeRequest);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar con el servidor. Verifica que el backend esté corriendo.');
      }
      throw error;
    }
  }

  /**
   * Petición PUT
   */
  async put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const makeRequest = () => fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: this.getHeaders(options),
      body: JSON.stringify(data),
      ...options,
    });

    const response = await makeRequest();
    return this.handleResponse<T>(response, url, options, makeRequest);
  }

  /**
   * Petición PATCH
   */
  async patch<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const makeRequest = () => fetch(`${this.baseURL}${url}`, {
      method: 'PATCH',
      headers: this.getHeaders(options),
      body: JSON.stringify(data),
      ...options,
    });

    const response = await makeRequest();
    return this.handleResponse<T>(response, url, options, makeRequest);
  }

  /**
   * Petición DELETE
   */
  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    const makeRequest = () => fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: this.getHeaders(options),
      ...options,
    });

    const response = await makeRequest();
    return this.handleResponse<T>(response, url, options, makeRequest);
  }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();
