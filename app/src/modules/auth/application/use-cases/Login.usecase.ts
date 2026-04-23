// Caso de uso: Login
// Autentica al usuario y genera un token JWT

import { UserRepository } from '../../../users/domain/repositories/UserRepository.interface';
import { RoleRepository } from '../../../users/domain/repositories/RoleRepository.interface';
import { PermissionRepository } from '../../../users/domain/repositories/PermissionRepository.interface';
import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository.interface';
import { LoginCommand } from '../commands/LoginCommand';
import { LoginResult } from '../results/LoginResult';
import { PasswordHasher } from '../../domain/services/PasswordHasher.interface';
import { TokenGenerator } from '../ports/TokenGenerator.interface';
import { AuthContextProvider } from '../ports/AuthContextProvider.interface';
import { InvalidCredentialsException } from '../../domain/exceptions/InvalidCredentialsException';
import { InactiveUserException } from '../../domain/exceptions/InactiveUserException';
import { AccountLockedException } from '../../domain/exceptions/AccountLockedException';

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator,
    private readonly authContextProvider: AuthContextProvider,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Verificar que el usuario esté activo
    if (!user.isActive()) {
      throw new InactiveUserException();
    }

    // Verificar si la cuenta está bloqueada por intentos fallidos
    if (user.isLocked()) {
      const minutesRemaining = Math.ceil(
        (user.lockedUntil!.getTime() - Date.now()) / 60000,
      );
      throw new AccountLockedException(minutesRemaining);
    }

    // Verificar contraseña usando el puerto PasswordHasher
    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      // Registrar intento fallido y potencialmente bloquear
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      const lockMinutes = parseInt(process.env.LOCK_DURATION_MINUTES || '15');
      user.registerFailedLogin(maxAttempts, lockMinutes);
      await this.userRepository.updateLoginAttempts(
        user.id,
        user.failedLoginAttempts,
        user.lockedUntil,
      );
      throw new InvalidCredentialsException();
    }

    // Login exitoso: resetear intentos fallidos si había alguno
    if (user.failedLoginAttempts > 0) {
      user.resetFailedLoginAttempts();
      await this.userRepository.updateLoginAttempts(user.id, 0, null);
    }

    // Obtener roles del usuario
    const roleIds = await this.userRepository.getUserRoles(user.id);

    // Obtener permisos de todos los roles en paralelo (evitar N+1)
    const allPermissionIds = await Promise.all(
      roleIds.map((roleId) => this.roleRepository.getRolePermissions(roleId))
    );
    const uniquePermissionIds = [...new Set(allPermissionIds.flat())];
    const permissions = await this.permissionRepository.findByIds(uniquePermissionIds);
    const allPermissionCodes = permissions.map((p) => p.code);

    // Resolver contexto multi-tenant: organización activa y nombres de roles
    // ► La `organizationId` queda embebida en el JWT y es la única
    //   fuente de verdad para el resto del sistema.
    const [organizationId, roleNames] = await Promise.all([
      this.authContextProvider.resolveOrganizationIdForUser(user.id),
      this.authContextProvider.resolveRoleNamesForUser(user.id),
    ]);

    // Generar token JWT usando el puerto TokenGenerator
    const accessToken = this.tokenGenerator.sign({
      sub: user.id,
      email: user.email.value,
      organizationId,
      roles: roleNames,
      permissions: allPermissionCodes,
    });

    // Generar refresh token (JWT con expiración más larga)
    const refreshTokenString = this.tokenGenerator.signRefresh({
      sub: user.id,
      email: user.email.value,
      organizationId,
    });

    // Calcular fecha de expiración del refresh token
    const accessTokenExpiration = process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m';
    const refreshTokenExpiration = process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d';

    const refreshTokenExpiresAt = this.calculateExpirationDate(
      refreshTokenExpiration
    );

    // Guardar el refresh token en la base de datos
    // El repositorio eliminará automáticamente tokens antiguos del usuario
    await this.refreshTokenRepository.create(
      user.id,
      refreshTokenString,
      refreshTokenExpiresAt
    );

    // Retornar resultado del caso de uso
    return new LoginResult(
      accessToken,
      refreshTokenString,
      accessTokenExpiration,
      user.id,
      user.email.value,
      [...new Set(allPermissionCodes)]
    );
  }

  // Método auxiliar para calcular la fecha de expiración
  private calculateExpirationDate(expiration: string): Date {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Formato de expiración inválido: ${expiration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const now = new Date();
    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        throw new Error(`Unidad de expiración inválida: ${unit}`);
    }
  }
}
