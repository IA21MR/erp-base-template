// Caso de uso: RefreshToken
// Valida el refresh token y genera un nuevo access token

import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository.interface';
import { UserRepository } from '../../../users/domain/repositories/UserRepository.interface';
import { RoleRepository } from '../../../users/domain/repositories/RoleRepository.interface';
import { PermissionRepository } from '../../../users/domain/repositories/PermissionRepository.interface';
import { RefreshTokenCommand } from '../commands/RefreshTokenCommand';
import { RefreshTokenResult } from '../results/RefreshTokenResult';
import { TokenGenerator } from '../ports/TokenGenerator.interface';
import { AuthContextProvider } from '../ports/AuthContextProvider.interface';
import { InvalidRefreshTokenException } from '../../domain/exceptions/InvalidRefreshTokenException';
import { ExpiredRefreshTokenException } from '../../domain/exceptions/ExpiredRefreshTokenException';
import { InactiveUserException } from '../../domain/exceptions/InactiveUserException';

export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly tokenGenerator: TokenGenerator,
    private readonly authContextProvider: AuthContextProvider,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    // Buscar el refresh token en la base de datos
    const refreshToken = await this.refreshTokenRepository.findByToken(
      command.refreshToken
    );

    if (!refreshToken) {
      throw new InvalidRefreshTokenException();
    }

    // Verificar si el token ha expirado
    if (refreshToken.isExpired()) {
      // Eliminar el token expirado
      await this.refreshTokenRepository.deleteByToken(command.refreshToken);
      throw new ExpiredRefreshTokenException();
    }

    // Buscar el usuario asociado al refresh token
    const user = await this.userRepository.findById(refreshToken.userId);
    if (!user) {
      throw new InvalidRefreshTokenException();
    }

    // Verificar que el usuario esté activo
    if (!user.isActive()) {
      throw new InactiveUserException();
    }

    // Obtener roles y permisos del usuario
    const roleIds = await this.userRepository.getUserRoles(user.id);

    // Obtener permisos de todos los roles en paralelo (evitar N+1)
    const allPermissionIds = await Promise.all(
      roleIds.map((roleId) => this.roleRepository.getRolePermissions(roleId))
    );
    const uniquePermissionIds = [...new Set(allPermissionIds.flat())];
    const permissions = await this.permissionRepository.findByIds(uniquePermissionIds);
    const allPermissionCodes = permissions.map((p) => p.code);

    // Re-resolver el contexto multi-tenant en cada refresh: los roles y la
    // organización del usuario pueden haber cambiado desde el login anterior.
    const [organizationId, roleNames] = await Promise.all([
      this.authContextProvider.resolveOrganizationIdForUser(user.id),
      this.authContextProvider.resolveRoleNamesForUser(user.id),
    ]);

    // Generar nuevo access token con los permisos actualizados
    const accessToken = this.tokenGenerator.sign({
      sub: user.id,
      email: user.email.value,
      organizationId,
      roles: roleNames,
      permissions: allPermissionCodes,
    });

    // Rotación de refresh token: generar nuevo y revocar el anterior
    const newRefreshTokenString = this.tokenGenerator.signRefresh({
      sub: user.id,
      email: user.email.value,
      organizationId,
    });

    const refreshTokenExpiration = process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d';
    const refreshTokenExpiresAt = this.calculateExpirationDate(refreshTokenExpiration);

    // Eliminar el refresh token anterior
    await this.refreshTokenRepository.deleteByToken(command.refreshToken);

    // Guardar el nuevo refresh token
    await this.refreshTokenRepository.create(
      user.id,
      newRefreshTokenString,
      refreshTokenExpiresAt
    );

    // Retornar ambos tokens
    const accessTokenExpiration = process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m';
    return new RefreshTokenResult(accessToken, newRefreshTokenString, accessTokenExpiration);
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
