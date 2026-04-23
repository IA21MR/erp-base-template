/**
 * Exportaciones centralizadas del módulo de autenticación
 */

// Domain
export type { User } from './domain/entities/User.entity';
export type { AuthTokens } from './domain/entities/AuthTokens.entity';
export type { IAuthRepository } from './domain/repositories/AuthRepository.interface';

// Application - Login
export type { LoginDTO } from './application/dtos/Login.dto';
export type { LoginResponseDTO } from './application/dtos/LoginResponse.dto';
export { LoginUseCase } from './application/use-cases/Login.usecase';

// Application - Password Reset
export type { ForgotPasswordDTO } from './application/dtos/ForgotPassword.dto';
export type { VerifyResetCodeDTO } from './application/dtos/VerifyResetCode.dto';
export type { ResetPasswordDTO } from './application/dtos/ResetPassword.dto';
export { ForgotPasswordUseCase } from './application/use-cases/ForgotPassword.usecase';
export { VerifyResetCodeUseCase } from './application/use-cases/VerifyResetCode.usecase';
export { ResetPasswordUseCase } from './application/use-cases/ResetPassword.usecase';

// Application - Logout
export { LogoutUseCase } from './application/use-cases/Logout.usecase';

// Infrastructure
export { AuthHttpRepository } from './infrastructure/repositories/AuthHttpRepository';

// Presentation - Components
export { LoginForm } from './presentation/components/LoginForm';
export { ForgotPasswordForm } from './presentation/components/ForgotPasswordForm';
export { VerifyCodeForm } from './presentation/components/VerifyCodeForm';
export { ResetPasswordForm } from './presentation/components/ResetPasswordForm';
export { ProtectedRoute } from './presentation/components/ProtectedRoute';

// Presentation - Hooks
export { useLogin } from './presentation/hooks/useLogin';
export { useAuth } from './presentation/hooks/useAuth';
export { useAuthToken } from './presentation/hooks/useAuthToken';
export { useLogout } from './presentation/hooks/useLogout';
export { useForgotPassword } from './presentation/hooks/useForgotPassword';
export { useVerifyResetCode } from './presentation/hooks/useVerifyResetCode';
export { useResetPassword } from './presentation/hooks/useResetPassword';
export { usePermissions } from './presentation/hooks/usePermissions';

// Types
export type { UseLoginResult } from './presentation/hooks/useLogin';
export type { UseAuthResult } from './presentation/hooks/useAuth';
export type { UseAuthTokenResult } from './presentation/hooks/useAuthToken';
export type { UseLogoutResult } from './presentation/hooks/useLogout';
export type { UsePermissionsResult } from './presentation/hooks/usePermissions';
