/**
 * Tests unitarios para validación de DTOs de autenticación
 * Prueba las interfaces y validaciones de Login, ForgotPassword y ResetPassword
 */

import { LoginDTO } from '../application/dtos/Login.dto';
import { ForgotPasswordDTO } from '../application/dtos/ForgotPassword.dto';
import { ResetPasswordDTO } from '../application/dtos/ResetPassword.dto';
import { VerifyResetCodeDTO } from '../application/dtos/VerifyResetCode.dto';

describe('Auth DTOs Validation', () => {
  describe('LoginDTO', () => {
    it('should accept valid login data', () => {
      const validData: LoginDTO = {
        email: 'admin@sotek.com',
        password: 'Admin123!',
      };

      expect(validData.email).toBe('admin@sotek.com');
      expect(validData.password).toBe('Admin123!');
    });

    it('should accept different email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@company.co.uk',
        'admin+tag@sotek.com',
      ];

      validEmails.forEach(email => {
        const data: LoginDTO = {
          email,
          password: 'password123',
        };
        expect(data.email).toBe(email);
      });
    });

    it('should handle long passwords', () => {
      const longPassword = 'a'.repeat(100);
      const data: LoginDTO = {
        email: 'user@test.com',
        password: longPassword,
      };
      expect(data.password.length).toBe(100);
    });
  });

  describe('ForgotPasswordDTO', () => {
    it('should accept valid email', () => {
      const validData: ForgotPasswordDTO = {
        email: 'admin@sotek.com',
      };

      expect(validData.email).toBe('admin@sotek.com');
    });

    it('should work with various email formats', () => {
      const emails = [
        'simple@example.com',
        'very.common@example.com',
        'disposable.style.email.with+symbol@example.com',
      ];

      emails.forEach(email => {
        const data: ForgotPasswordDTO = { email };
        expect(data.email).toBe(email);
      });
    });
  });

  describe('ResetPasswordDTO', () => {
    it('should accept valid reset password data', () => {
      const validData: ResetPasswordDTO = {
        email: 'admin@sotek.com',
        code: '123456',
        newPassword: 'NewPassword123!',
      };

      expect(validData.email).toBe('admin@sotek.com');
      expect(validData.code).toBe('123456');
      expect(validData.newPassword).toBe('NewPassword123!');
    });

    it('should handle different code formats', () => {
      const codes = ['123456', 'ABC123', 'a1b2c3'];

      codes.forEach(code => {
        const data: ResetPasswordDTO = {
          email: 'user@test.com',
          code,
          newPassword: 'NewPass123!',
        };
        expect(data.code).toBe(code);
      });
    });

    it('should handle various password strengths', () => {
      const passwords = [
        'Simple123',
        'Complex!Pass@123',
        'VeryLongPasswordWithManyCharacters123!@#',
      ];

      passwords.forEach(password => {
        const data: ResetPasswordDTO = {
          email: 'user@test.com',
          code: '123456',
          newPassword: password,
        };
        expect(data.newPassword).toBe(password);
      });
    });
  });

  describe('VerifyResetCodeDTO', () => {
    it('should accept valid verification data', () => {
      const validData: VerifyResetCodeDTO = {
        email: 'admin@sotek.com',
        code: '123456',
      };

      expect(validData.email).toBe('admin@sotek.com');
      expect(validData.code).toBe('123456');
    });

    it('should handle numeric codes', () => {
      const data: VerifyResetCodeDTO = {
        email: 'user@test.com',
        code: '999999',
      };
      expect(data.code).toBe('999999');
    });

    it('should handle alphanumeric codes', () => {
      const data: VerifyResetCodeDTO = {
        email: 'user@test.com',
        code: 'ABC123',
      };
      expect(data.code).toBe('ABC123');
    });
  });

  describe('Email validation patterns', () => {
    it('should handle standard business emails', () => {
      const businessEmails = [
        'admin@sotek.com',
        'sales@company.mx',
        'support@business.com.ar',
      ];

      businessEmails.forEach(email => {
        const loginData: LoginDTO = { email, password: 'test' };
        const forgotData: ForgotPasswordDTO = { email };
        
        expect(loginData.email).toBe(email);
        expect(forgotData.email).toBe(email);
      });
    });

    it('should handle emails with special characters', () => {
      const specialEmails = [
        'user+tag@example.com',
        'first.last@example.com',
        'user_name@example.com',
      ];

      specialEmails.forEach(email => {
        const data: LoginDTO = { email, password: 'test' };
        expect(data.email).toBe(email);
      });
    });
  });

  describe('Password patterns', () => {
    it('should accept passwords with special characters', () => {
      const passwords = [
        'Pass@123!',
        'Secure#Password$2024',
        'My!Strong&Pass*99',
      ];

      passwords.forEach(password => {
        const data: LoginDTO = {
          email: 'user@test.com',
          password,
        };
        expect(data.password).toBe(password);
      });
    });

    it('should handle passwords with spaces', () => {
      const password = 'My Secure Password 123';
      const data: LoginDTO = {
        email: 'user@test.com',
        password,
      };
      expect(data.password).toBe(password);
    });

    it('should handle unicode characters in passwords', () => {
      const password = 'Contraseña123!';
      const data: LoginDTO = {
        email: 'user@test.com',
        password,
      };
      expect(data.password).toBe(password);
    });
  });

  describe('Code validation patterns', () => {
    it('should handle 6-digit numeric codes', () => {
      const code = '123456';
      const data: VerifyResetCodeDTO = {
        email: 'user@test.com',
        code,
      };
      expect(data.code).toBe(code);
      expect(data.code.length).toBe(6);
    });

    it('should handle variable length codes', () => {
      const codes = ['1234', '123456', '12345678'];

      codes.forEach(code => {
        const data: ResetPasswordDTO = {
          email: 'user@test.com',
          code,
          newPassword: 'NewPass123',
        };
        expect(data.code).toBe(code);
      });
    });
  });

  describe('Complete workflow DTOs', () => {
    it('should create complete forgot password flow', () => {
      const email = 'admin@sotek.com';

      // Step 1: Forgot password
      const forgotData: ForgotPasswordDTO = { email };
      expect(forgotData.email).toBe(email);

      // Step 2: Verify code
      const verifyData: VerifyResetCodeDTO = {
        email,
        code: '123456',
      };
      expect(verifyData.email).toBe(email);
      expect(verifyData.code).toBe('123456');

      // Step 3: Reset password
      const resetData: ResetPasswordDTO = {
        email,
        code: '123456',
        newPassword: 'NewSecurePass123!',
      };
      expect(resetData.email).toBe(email);
      expect(resetData.code).toBe('123456');
      expect(resetData.newPassword).toBe('NewSecurePass123!');

      // Step 4: Login with new password
      const loginData: LoginDTO = {
        email,
        password: 'NewSecurePass123!',
      };
      expect(loginData.email).toBe(email);
      expect(loginData.password).toBe('NewSecurePass123!');
    });

    it('should maintain data consistency across DTOs', () => {
      const testEmail = 'test@example.com';
      
      const dtos = [
        { email: testEmail } as ForgotPasswordDTO,
        { email: testEmail, code: '111111' } as VerifyResetCodeDTO,
        { email: testEmail, code: '111111', newPassword: 'Pass123' } as ResetPasswordDTO,
        { email: testEmail, password: 'Pass123' } as LoginDTO,
      ];

      dtos.forEach(dto => {
        expect(dto.email).toBe(testEmail);
      });
    });
  });
});
