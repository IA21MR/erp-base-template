import { ResetPasswordUseCase } from './ResetPassword.usecase';
import { ResetPasswordCommand } from '../commands/ResetPasswordCommand';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFoundException';
import { InactiveUserException } from '../../domain/exceptions/InactiveUserException';
import { PasswordMismatchException } from '../../domain/exceptions/PasswordMismatchException';
import { InvalidResetCodeException } from '../../domain/exceptions/InvalidResetCodeException';
import { ExpiredResetCodeException } from '../../domain/exceptions/ExpiredResetCodeException';
import { UsedResetCodeException } from '../../domain/exceptions/UsedResetCodeException';
import { WeakPasswordException } from '../../domain/exceptions/WeakPasswordException';

describe('ResetPasswordUseCase', () => {
  const mockUserRepo = {
    findByEmail: jest.fn(),
    update: jest.fn(),
  };

  const mockPasswordResetRepo = {
    findLatestByUser: jest.fn(),
    markAsUsed: jest.fn(),
  };

  const mockPasswordHasher = {
    compare: jest.fn(),
    hash: jest.fn(),
  };

  let useCase: ResetPasswordUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new ResetPasswordUseCase(
      mockUserRepo as any,
      mockPasswordResetRepo as any,
      mockPasswordHasher as any,
    );

    // Defaults: happy path
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: { value: 'admin@test.com' },
      passwordHash: 'old_hash',
      isActive: () => true,
      updatePassword: jest.fn(),
    });
    mockPasswordResetRepo.findLatestByUser.mockResolvedValue({
      id: 10,
      code: 'hashed_code',
      used: false,
      isValid: () => true,
      isExpired: () => false,
    });
    mockPasswordHasher.compare.mockResolvedValue(true);
    mockPasswordHasher.hash.mockResolvedValue('new_hashed_pw');
  });

  it('debería restablecer la contraseña exitosamente', async () => {
    const command = new ResetPasswordCommand(
      'admin@test.com',
      '123456',
      'NewPassword123',
      'NewPassword123',
    );
    const result = await useCase.execute(command);

    expect(result.success).toBe(true);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('NewPassword123');
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
    expect(mockPasswordResetRepo.markAsUsed).toHaveBeenCalledWith(10);
  });

  it('debería lanzar PasswordMismatchException si las contraseñas no coinciden', async () => {
    const command = new ResetPasswordCommand(
      'admin@test.com',
      '123456',
      'NewPassword123',
      'DifferentPassword',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      PasswordMismatchException,
    );
  });

  it('debería lanzar WeakPasswordException si la contraseña es débil', async () => {
    const command = new ResetPasswordCommand(
      'admin@test.com',
      '123456',
      'weak',
      'weak',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      WeakPasswordException,
    );
  });

  it('debería lanzar UserNotFoundException si el usuario no existe', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    const command = new ResetPasswordCommand(
      'noexiste@test.com',
      '123456',
      'NewPassword123',
      'NewPassword123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it('debería lanzar InactiveUserException si el usuario está inactivo', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: { value: 'admin@test.com' },
      isActive: () => false,
    });

    const command = new ResetPasswordCommand(
      'admin@test.com',
      '123456',
      'NewPassword123',
      'NewPassword123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      InactiveUserException,
    );
  });

  it('debería lanzar InvalidResetCodeException si no hay código', async () => {
    mockPasswordResetRepo.findLatestByUser.mockResolvedValue(null);

    const command = new ResetPasswordCommand(
      'admin@test.com',
      '123456',
      'NewPassword123',
      'NewPassword123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      InvalidResetCodeException,
    );
  });

  it('debería lanzar UsedResetCodeException si el código ya fue usado', async () => {
    mockPasswordResetRepo.findLatestByUser.mockResolvedValue({
      id: 10,
      code: 'hashed_code',
      used: true,
      isValid: () => false,
      isExpired: () => false,
    });

    const command = new ResetPasswordCommand(
      'admin@test.com',
      '123456',
      'NewPassword123',
      'NewPassword123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      UsedResetCodeException,
    );
  });

  it('debería lanzar ExpiredResetCodeException si el código expiró', async () => {
    mockPasswordResetRepo.findLatestByUser.mockResolvedValue({
      id: 10,
      code: 'hashed_code',
      used: false,
      isValid: () => false,
      isExpired: () => true,
    });

    const command = new ResetPasswordCommand(
      'admin@test.com',
      '123456',
      'NewPassword123',
      'NewPassword123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      ExpiredResetCodeException,
    );
  });

  it('debería lanzar InvalidResetCodeException si el código no coincide', async () => {
    mockPasswordHasher.compare.mockResolvedValue(false);

    const command = new ResetPasswordCommand(
      'admin@test.com',
      'wrong_code',
      'NewPassword123',
      'NewPassword123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      InvalidResetCodeException,
    );
  });
});
