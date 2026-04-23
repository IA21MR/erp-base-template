// Módulo de Autenticación para NestJS
// Configura JWT, Passport y casos de uso de auth

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../../infrastructure/database/prisma/prisma.module';

// Estrategias
import { JwtStrategy } from './security/strategies/JwtStrategy';

// Guards globales (cadena CORE de seguridad)
import { JwtAuthGuard } from './security/guards/JwtAuthGuard';
import { OrganizationContextGuard } from '../../../shared/infrastructure/guards/OrganizationContextGuard';
import { ModuleGuard } from '../../../shared/infrastructure/guards/ModuleGuard';

// Middleware multi-tenant
import { OrganizationContextMiddleware } from '../../../shared/infrastructure/http/OrganizationContextMiddleware';

// Controlador
import { AuthController } from '../interfaces/http/controllers/auth.controller';

// Casos de uso
import { LoginUseCase } from '../application/use-cases/Login.usecase';
import { ForgotPasswordUseCase } from '../application/use-cases/ForgotPassword.usecase';
import { VerifyResetCodeUseCase } from '../application/use-cases/VerifyResetCode.usecase';
import { ResetPasswordUseCase } from '../application/use-cases/ResetPassword.usecase';
import { RefreshTokenUseCase } from '../application/use-cases/RefreshToken.usecase';
import { LogoutUseCase } from '../application/use-cases/Logout.usecase';
import { GetProfileUseCase } from '../application/use-cases/GetProfile.usecase';
import { ChangePasswordUseCase } from '../application/use-cases/ChangePassword.usecase';

// Adaptadores de seguridad
import { BcryptPasswordHasher } from './security/adapters/BcryptPasswordHasher';
import { JwtTokenGenerator } from './security/adapters/JwtTokenGenerator';
import { RandomCodeGenerator } from './security/adapters/RandomCodeGenerator';
import { NodemailerEmailSender } from './security/adapters/NodemailerEmailSender';
import { DefaultAuthContextProvider } from './security/adapters/DefaultAuthContextProvider';

// Adaptadores de persistencia
import { PrismaPasswordResetRepository } from './persistence/PrismaPasswordResetRepository';
import { PrismaRefreshTokenRepository } from './persistence/PrismaRefreshTokenRepository';

// Tareas programadas
import { TokenCleanupTask } from './tasks/TokenCleanupTask';

// Módulo de persistencia de Users (reutiliza repos en lugar de re-registrarlos)
import { UsersPersistenceModule } from '../../users/infrastructure/persistence/Users.Persistence.Module';
import { USER_REPOSITORY, ROLE_REPOSITORY, PERMISSION_REPOSITORY } from '../../users/Users.Tokens';

// Tokens de inyección de dependencias del módulo Auth
import {
  PASSWORD_HASHER,
  TOKEN_GENERATOR,
  CODE_GENERATOR,
  EMAIL_SENDER,
  PASSWORD_RESET_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  AUTH_CONTEXT_PROVIDER,
} from '../Auth.Tokens';

@Module({
  imports: [
    PassportModule,
    PrismaModule,
    ConfigModule,
    ScheduleModule.forRoot(),
    UsersPersistenceModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET no está definido en las variables de entorno');
        }
        const expiresIn = configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION', '15m');
        return {
          secret,
          signOptions: { expiresIn: expiresIn as any },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    // Tarea programada de limpieza de tokens
    TokenCleanupTask,
    // Repositorios propios del módulo Auth
    {
      provide: PASSWORD_RESET_REPOSITORY,
      useClass: PrismaPasswordResetRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },
    // Adaptadores de seguridad
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_GENERATOR,
      useFactory: (jwtService: JwtService, configService: ConfigService) =>
        new JwtTokenGenerator(jwtService, configService),
      inject: [JwtService, ConfigService],
    },
    {
      provide: CODE_GENERATOR,
      useClass: RandomCodeGenerator,
    },
    {
      provide: EMAIL_SENDER,
      useClass: NodemailerEmailSender,
    },
    // Resolvedor de contexto multi-tenant (organización activa + nombres de roles)
    {
      provide: AUTH_CONTEXT_PROVIDER,
      useClass: DefaultAuthContextProvider,
    },
    // Caso de uso de Login
    {
      provide: LoginUseCase,
      useFactory: (
        userRepo: any,
        roleRepo: any,
        permissionRepo: any,
        refreshTokenRepo: any,
        passwordHasher: any,
        tokenGenerator: any,
        authContextProvider: any,
      ) =>
        new LoginUseCase(
          userRepo,
          roleRepo,
          permissionRepo,
          refreshTokenRepo,
          passwordHasher,
          tokenGenerator,
          authContextProvider,
        ),
      inject: [
        USER_REPOSITORY,
        ROLE_REPOSITORY,
        PERMISSION_REPOSITORY,
        REFRESH_TOKEN_REPOSITORY,
        PASSWORD_HASHER,
        TOKEN_GENERATOR,
        AUTH_CONTEXT_PROVIDER,
      ],
    },
    // Caso de uso de ForgotPassword
    {
      provide: ForgotPasswordUseCase,
      useFactory: (
        userRepo: any,
        passwordResetRepo: any,
        codeGenerator: any,
        passwordHasher: any,
        emailSender: any,
      ) =>
        new ForgotPasswordUseCase(
          userRepo,
          passwordResetRepo,
          codeGenerator,
          passwordHasher,
          emailSender,
        ),
      inject: [
        USER_REPOSITORY,
        PASSWORD_RESET_REPOSITORY,
        CODE_GENERATOR,
        PASSWORD_HASHER,
        EMAIL_SENDER,
      ],
    },
    // Caso de uso de VerifyResetCode
    {
      provide: VerifyResetCodeUseCase,
      useFactory: (
        userRepo: any,
        passwordResetRepo: any,
        passwordHasher: any
      ) => new VerifyResetCodeUseCase(userRepo, passwordResetRepo, passwordHasher),
      inject: [USER_REPOSITORY, PASSWORD_RESET_REPOSITORY, PASSWORD_HASHER],
    },
    // Caso de uso de ResetPassword
    {
      provide: ResetPasswordUseCase,
      useFactory: (
        userRepo: any,
        passwordResetRepo: any,
        passwordHasher: any
      ) =>
        new ResetPasswordUseCase(userRepo, passwordResetRepo, passwordHasher),
      inject: [USER_REPOSITORY, PASSWORD_RESET_REPOSITORY, PASSWORD_HASHER],
    },
    // Caso de uso de RefreshToken
    {
      provide: RefreshTokenUseCase,
      useFactory: (
        refreshTokenRepo: any,
        userRepo: any,
        roleRepo: any,
        permissionRepo: any,
        tokenGenerator: any,
        authContextProvider: any,
      ) =>
        new RefreshTokenUseCase(
          refreshTokenRepo,
          userRepo,
          roleRepo,
          permissionRepo,
          tokenGenerator,
          authContextProvider,
        ),
      inject: [
        REFRESH_TOKEN_REPOSITORY,
        USER_REPOSITORY,
        ROLE_REPOSITORY,
        PERMISSION_REPOSITORY,
        TOKEN_GENERATOR,
        AUTH_CONTEXT_PROVIDER,
      ],
    },
    // Caso de uso de Logout
    {
      provide: LogoutUseCase,
      useFactory: (refreshTokenRepo: any) =>
        new LogoutUseCase(refreshTokenRepo),
      inject: [REFRESH_TOKEN_REPOSITORY],
    },
    // Caso de uso de GetProfile
    {
      provide: GetProfileUseCase,
      useFactory: (userRepo: any) =>
        new GetProfileUseCase(userRepo),
      inject: [USER_REPOSITORY],
    },
    // Caso de uso de ChangePassword
    {
      provide: ChangePasswordUseCase,
      useFactory: (
        userRepo: any,
        passwordHasher: any,
      ) => new ChangePasswordUseCase(userRepo, passwordHasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
    // =====================================================================
    // Cadena CORE de guards globales (APP_GUARD).
    //
    // El orden de ejecución sigue el orden de registro:
    //   1. JwtAuthGuard           → autentica (respeta @Public).
    //   2. OrganizationContextGuard → materializa request.organization.id
    //                                desde request.user.organizationId.
    //   3. ModuleGuard            → valida módulo habilitado por org
    //                                (respeta @ModuleAccess).
    //
    // `PermissionsGuard` sigue a nivel de controlador porque se activa
    // únicamente con `@RequirePermissions(...)`.
    // =====================================================================
    JwtAuthGuard,
    OrganizationContextGuard,
    OrganizationContextMiddleware,
    { provide: APP_GUARD, useExisting: JwtAuthGuard },
    { provide: APP_GUARD, useExisting: OrganizationContextGuard },
    { provide: APP_GUARD, useExisting: ModuleGuard },
  ],
  exports: [JwtStrategy, JwtModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Middleware global que pre-calcula `request.organization` a partir del
    // JWT (verificando su firma) antes de que los guards se ejecuten.
    // También aplica el fallback por header cuando
    // `ALLOW_ORGANIZATION_HEADER_FALLBACK=true` y el request no está
    // autenticado.
    consumer.apply(OrganizationContextMiddleware).forRoutes('*');
  }
}
