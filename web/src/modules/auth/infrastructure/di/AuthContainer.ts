/**
 * Contenedor de dependencias del módulo de autenticación (frontend)
 * 
 * Centraliza la creación de instancias para evitar que los hooks
 * instancien directamente las implementaciones de infraestructura
 */
import { IAuthRepository } from '../../domain/repositories/AuthRepository.interface';
import { AuthHttpRepository } from '../repositories/AuthHttpRepository';
import { LoginUseCase } from '../../application/use-cases/Login.usecase';
import { LogoutUseCase } from '../../application/use-cases/Logout.usecase';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPassword.usecase';
import { VerifyResetCodeUseCase } from '../../application/use-cases/VerifyResetCode.usecase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPassword.usecase';

// Instancia singleton del repositorio
const authRepository: IAuthRepository = new AuthHttpRepository();

// Casos de uso inyectados con la implementación concreta
export const loginUseCase = new LoginUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository);
export const verifyResetCodeUseCase = new VerifyResetCodeUseCase(authRepository);
export const resetPasswordUseCase = new ResetPasswordUseCase(authRepository);

// Exportar repositorio para operaciones directas (getProfile, getAccessToken, etc.)
export { authRepository };
