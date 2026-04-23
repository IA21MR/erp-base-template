// Caso de uso: Solicitar restablecimiento de contraseña
// Genera código de 6 dígitos, lo hashea y envía el código plano por email

import { UserRepository } from '../../../users/domain/repositories/UserRepository.interface';
import { PasswordResetRepository } from '../../domain/repositories/PasswordResetRepository.interface';
import { CodeGenerator } from '../../domain/services/CodeGenerator.interface';
import { PasswordHasher } from '../../domain/services/PasswordHasher.interface';
import { EmailSender } from '../ports/EmailSender.interface';
import { ForgotPasswordCommand } from '../commands/ForgotPasswordCommand';
import { ForgotPasswordResult } from '../results/ForgotPasswordResult';

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly codeGenerator: CodeGenerator,
    private readonly passwordHasher: PasswordHasher,
    private readonly emailSender: EmailSender,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<ForgotPasswordResult> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(command.email);

    // Por seguridad, siempre respondemos igual (no revelar si el email existe)
    if (!user) {
      // Simulamos un pequeño delay para no revelar timing
      await this.delay(Math.random() * 500 + 500);
      return new ForgotPasswordResult(
        'Si el correo existe, se enviará un código de verificación.'
      );
    }

    // Verificar que el usuario esté activo
    if (!user.isActive()) {
      // Usuario inactivo, no permitir restablecimiento
      return new ForgotPasswordResult(
        'Si el correo existe, se enviará un código de verificación.'
      );
    }

    // Eliminar códigos antiguos del usuario
    await this.passwordResetRepository.deleteOldCodes(user.id);

    // Generar código de 6 dígitos
    const code = this.codeGenerator.generate();

    // Calcular fecha de expiración
    const expirationMinutes = parseInt(process.env.RESET_CODE_TTL_MINUTES || '15');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    // Hashear el código antes de almacenarlo en BD
    const hashedCode = await this.passwordHasher.hash(code);

    // Guardar código hasheado en la base de datos
    await this.passwordResetRepository.create(user.id, hashedCode, expiresAt);

    // Enviar email con el código plano
    await this.emailSender.sendPasswordResetCode(user.email.value, code);

    return new ForgotPasswordResult(
      'Si el correo existe, se enviará un código de verificación.'
    );
  }

  // Helper para simular delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
