import { ChangePasswordUseCase } from './ChangePassword.usecase';
import { ChangePasswordCommand } from '../commands/ChangePasswordCommand';
import { InvalidCredentialsException } from '../../domain/exceptions/InvalidCredentialsException';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFoundException';
import { PasswordMismatchException } from '../../domain/exceptions/PasswordMismatchException';
import { WeakPasswordException } from '../../domain/exceptions/WeakPasswordException';

describe('ChangePasswordUseCase', () => {
  const mockUserRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockPasswordHasher = {
    compare: jest.fn(),
    hash: jest.fn(),
  };

  let useCase: ChangePasswordUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new ChangePasswordUseCase(
      mockUserRepo as any,
      mockPasswordHasher as any,
    );

    // Defaults: happy path
    mockUserRepo.findById.mockResolvedValue({
      id: 1,
      passwordHash: 'old_hashed_pw',
      updatePassword: jest.fn(),
    });
    mockPasswordHasher.compare.mockResolvedValue(true);
    mockPasswordHasher.hash.mockResolvedValue('new_hashed_pw');
  });

  it('debería cambiar la contraseña exitosamente', async () => {
    const command = new ChangePasswordCommand(
      1,
      'OldPassword123',
      'NewPassword123',
      'NewPassword123',
    );
    const result = await useCase.execute(command);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Contraseña actualizada exitosamente');
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('NewPassword123');
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
  });

  it('debería lanzar PasswordMismatchException si las contraseñas no coinciden', async () => {
    const command = new ChangePasswordCommand(
      1,
      'OldPassword123',
      'NewPassword123',
      'DifferentPassword123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      PasswordMismatchException,
    );
  });

  it('debería lanzar UserNotFoundException si el usuario no existe', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    const command = new ChangePasswordCommand(
      999,
      'OldPassword123',
      'NewPassword123',
      'NewPassword123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it('debería lanzar InvalidCredentialsException si la contraseña actual es incorrecta', async () => {
    mockPasswordHasher.compare.mockResolvedValue(false);

    const command = new ChangePasswordCommand(
      1,
      'WrongPassword',
      'NewPassword123',
      'NewPassword123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('debería lanzar WeakPasswordException si la contraseña es muy corta', async () => {
    const command = new ChangePasswordCommand(
      1,
      'OldPassword123',
      'Short1A',
      'Short1A',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      WeakPasswordException,
    );
  });

  it('debería lanzar WeakPasswordException si falta mayúscula', async () => {
    const command = new ChangePasswordCommand(
      1,
      'OldPassword123',
      'newpassword123',
      'newpassword123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      WeakPasswordException,
    );
  });

  it('debería lanzar WeakPasswordException si falta minúscula', async () => {
    const command = new ChangePasswordCommand(
      1,
      'OldPassword123',
      'NEWPASSWORD123',
      'NEWPASSWORD123',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      WeakPasswordException,
    );
  });

  it('debería lanzar WeakPasswordException si falta número', async () => {
    const command = new ChangePasswordCommand(
      1,
      'OldPassword123',
      'NewPasswordNoNum',
      'NewPasswordNoNum',
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      WeakPasswordException,
    );
  });
});
