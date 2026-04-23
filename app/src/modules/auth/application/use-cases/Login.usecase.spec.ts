import { LoginUseCase } from './Login.usecase';
import { LoginCommand } from '../commands/LoginCommand';
import { InvalidCredentialsException } from '../../domain/exceptions/InvalidCredentialsException';
import { InactiveUserException } from '../../domain/exceptions/InactiveUserException';
import { AccountLockedException } from '../../domain/exceptions/AccountLockedException';

describe('LoginUseCase', () => {
  const mockUserRepo = {
    findByEmail: jest.fn(),
    getUserRoles: jest.fn(),
    updateLoginAttempts: jest.fn(),
  };

  const mockRoleRepo = {
    getRolePermissions: jest.fn(),
  };

  const mockPermissionRepo = {
    findByIds: jest.fn(),
  };

  const mockRefreshTokenRepo = {
    create: jest.fn(),
  };

  const mockPasswordHasher = {
    compare: jest.fn(),
    hash: jest.fn(),
  };

  const mockTokenGenerator = {
    sign: jest.fn(),
    signRefresh: jest.fn(),
    verify: jest.fn(),
  };

  const mockAuthContextProvider = {
    resolveOrganizationIdForUser: jest.fn(),
    resolveRoleNamesForUser: jest.fn(),
  };

  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new LoginUseCase(
      mockUserRepo as any,
      mockRoleRepo as any,
      mockPermissionRepo as any,
      mockRefreshTokenRepo as any,
      mockPasswordHasher as any,
      mockTokenGenerator as any,
      mockAuthContextProvider as any,
    );

    // Defaults: happy path
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: { value: 'admin@test.com' },
      passwordHash: 'hashed_pw',
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: () => true,
      isLocked: () => false,
      registerFailedLogin: jest.fn(),
      resetFailedLoginAttempts: jest.fn(),
    });
    mockPasswordHasher.compare.mockResolvedValue(true);
    mockUserRepo.getUserRoles.mockResolvedValue([1]);
    mockRoleRepo.getRolePermissions.mockResolvedValue([1, 2]);
    mockPermissionRepo.findByIds.mockResolvedValue([
      { id: 1, code: 'users.read' },
      { id: 2, code: 'users.write' },
    ]);
    mockTokenGenerator.sign.mockReturnValue('access_token');
    mockTokenGenerator.signRefresh.mockReturnValue('refresh_token');
    mockAuthContextProvider.resolveOrganizationIdForUser.mockResolvedValue(
      'org-uuid',
    );
    mockAuthContextProvider.resolveRoleNamesForUser.mockResolvedValue(['admin']);
  });

  it('debería autenticar con credenciales válidas', async () => {
    const command = new LoginCommand('admin@test.com', 'Password123');
    const result = await useCase.execute(command);

    expect(result.accessToken).toBe('access_token');
    expect(result.refreshToken).toBe('refresh_token');
    expect(mockRefreshTokenRepo.create).toHaveBeenCalledTimes(1);
  });

  it('debería lanzar InvalidCredentialsException si el usuario no existe', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    const command = new LoginCommand('noexiste@test.com', 'Password123');
    await expect(useCase.execute(command)).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('debería lanzar InactiveUserException si el usuario está inactivo', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: { value: 'admin@test.com' },
      passwordHash: 'hashed_pw',
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: () => false,
      isLocked: () => false,
    });

    const command = new LoginCommand('admin@test.com', 'Password123');
    await expect(useCase.execute(command)).rejects.toThrow(
      InactiveUserException,
    );
  });

  it('debería lanzar AccountLockedException si la cuenta está bloqueada', async () => {
    const futureDate = new Date(Date.now() + 10 * 60000);
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: { value: 'admin@test.com' },
      passwordHash: 'hashed_pw',
      failedLoginAttempts: 5,
      lockedUntil: futureDate,
      isActive: () => true,
      isLocked: () => true,
    });

    const command = new LoginCommand('admin@test.com', 'Password123');
    await expect(useCase.execute(command)).rejects.toThrow(
      AccountLockedException,
    );
  });

  it('debería registrar intento fallido con contraseña incorrecta', async () => {
    const mockUser = {
      id: 1,
      email: { value: 'admin@test.com' },
      passwordHash: 'hashed_pw',
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: () => true,
      isLocked: () => false,
      registerFailedLogin: jest.fn(),
    };
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockPasswordHasher.compare.mockResolvedValue(false);

    const command = new LoginCommand('admin@test.com', 'WrongPassword');
    await expect(useCase.execute(command)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(mockUser.registerFailedLogin).toHaveBeenCalledWith(5, 15);
    expect(mockUserRepo.updateLoginAttempts).toHaveBeenCalledTimes(1);
  });

  it('debería resetear intentos fallidos en login exitoso', async () => {
    const mockUser = {
      id: 1,
      email: { value: 'admin@test.com' },
      passwordHash: 'hashed_pw',
      failedLoginAttempts: 3,
      lockedUntil: null,
      isActive: () => true,
      isLocked: () => false,
      resetFailedLoginAttempts: jest.fn(),
    };
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);

    const command = new LoginCommand('admin@test.com', 'Password123');
    await useCase.execute(command);

    expect(mockUser.resetFailedLoginAttempts).toHaveBeenCalled();
    expect(mockUserRepo.updateLoginAttempts).toHaveBeenCalledWith(1, 0, null);
  });
});
