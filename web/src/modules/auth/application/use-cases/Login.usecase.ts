/**
 * Caso de uso: Login
 * Orquesta el proceso de inicio de sesión
 */
import { IAuthRepository } from '../../domain/repositories/AuthRepository.interface';
import { LoginDTO } from '../dtos/Login.dto';
import { AuthTokens } from '../../domain/entities/AuthTokens.entity';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Ejecuta el caso de uso de login
   * @param loginData - Credenciales del usuario
   * @returns Tokens de autenticación
   */
  async execute(loginData: LoginDTO): Promise<AuthTokens> {
    const { email, password } = loginData;

    // Validación básica
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Delegar al repositorio la autenticación
    const tokens = await this.authRepository.login(email, password);

    return tokens;
  }
}
