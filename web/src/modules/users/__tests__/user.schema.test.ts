/**
 * Tests unitarios para validación del schema de usuarios
 * Prueba las validaciones Zod del formulario de usuario
 */

import { userSchema, type UserFormData } from '../application/validations/user.schema';

describe('User Schema Validation', () => {
  describe('Valid user data', () => {
    it('should accept valid user data with all fields', () => {
      const validData: UserFormData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        roleIds: [1],
        active: true,
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept user data without optional fields', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty password for editing user', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        password: '',
        confirmPassword: '',
        roleIds: [1],
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept multiple roles', () => {
      const validData = {
        name: 'Admin User',
        email: 'admin@sotek.com',
        password: 'Admin123!',
        confirmPassword: 'Admin123!',
        roleIds: [1, 2, 3],
        active: true,
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Name validation', () => {
    it('should reject name with less than 2 characters', () => {
      const invalidData = {
        name: 'J',
        email: 'juan@sotek.com',
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El nombre debe tener al menos 2 caracteres');
      }
    });

    it('should reject name with more than 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        email: 'juan@sotek.com',
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El nombre no puede exceder 100 caracteres');
      }
    });

    it('should accept name with special characters', () => {
      const validData = {
        name: 'María José García-Pérez',
        email: 'maria@sotek.com',
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept name with exactly 2 characters', () => {
      const validData = {
        name: 'Jo',
        email: 'jo@sotek.com',
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Email validation', () => {
    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'invalid-email',
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email inválido');
      }
    });

    it('should reject email without domain', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@',
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject email without @', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juansotek.com',
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept various valid email formats', () => {
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user_name@example.co.uk',
        'user123@subdomain.example.com',
      ];

      validEmails.forEach(email => {
        const data = {
          name: 'Test User',
          email,
        };
        const result = userSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject email exceeding 100 characters', () => {
      // Crear un email válido de 101 caracteres
      const longEmail = 'a'.repeat(85) + '@example.com'; // 85 + 12 = 97, necesitamos más
      const veryLongEmail = 'test' + 'a'.repeat(82) + '@example.com'; // 4+82+12 = 98, aún más
      const exceedingEmail = 'user' + 'a'.repeat(83) + '@example.com'; // 4+83+12 = 99
      const tooLongEmail = 'email' + 'a'.repeat(82) + '@example.com'; // 5+82+12 = 99
      const finalEmail = 'testuser' + 'a'.repeat(79) + '@example.com'; // 8+79+12 = 99
      const actuallyTooLong = 'verylongemailaddress' + 'a'.repeat(68) + '@example.com'; // 20+68+12 = 100
      const definitelyTooLong = 'verylongemailaddress' + 'a'.repeat(69) + '@example.com'; // 20+69+12 = 101
      
      const invalidData = {
        name: 'Juan Pérez',
        email: definitelyTooLong,
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El email no puede exceder 100 caracteres');
      }
    });
  });

  describe('Password validation', () => {
    it('should reject password with less than 8 characters', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        password: 'Pass12!',
        confirmPassword: 'Pass12!',
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 8 caracteres');
      }
    });

    it('should reject password exceeding 100 characters', () => {
      const longPassword = 'P'.repeat(101);
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        password: longPassword,
        confirmPassword: longPassword,
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La contraseña no puede exceder 100 caracteres');
      }
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPass123!',
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmPasswordError = result.error.issues.find(
          issue => issue.path.includes('confirmPassword')
        );
        expect(confirmPasswordError?.message).toBe('Las contraseñas no coinciden');
      }
    });

    it('should accept matching passwords', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept password with special characters', () => {
      const passwords = [
        'Pass@123!',
        'Secure#Password$2024',
        'My!Strong&Pass*99',
        'P@ssw0rd_2024',
      ];

      passwords.forEach(password => {
        const data = {
          name: 'Test User',
          email: 'test@example.com',
          password,
          confirmPassword: password,
        };
        const result = userSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept exactly 8 characters password', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        password: 'Pass1234',
        confirmPassword: 'Pass1234',
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('RoleIds validation', () => {
    it('should accept array of role IDs', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        roleIds: [1, 2, 3],
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept single role', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        roleIds: [1],
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty roleIds when optional', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Active flag validation', () => {
    it('should accept active=true', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        active: true,
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept active=false', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
        active: false,
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept missing active flag', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@sotek.com',
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Complete user creation workflow', () => {
    it('should validate complete new user data', () => {
      const newUserData = {
        name: 'Nuevo Usuario',
        email: 'nuevo@sotek.com',
        password: 'InitialPass123!',
        confirmPassword: 'InitialPass123!',
        roleIds: [2],
        active: true,
      };

      const result = userSchema.safeParse(newUserData);
      expect(result.success).toBe(true);
    });

    it('should validate user edit without password change', () => {
      const editUserData = {
        name: 'Usuario Editado',
        email: 'editado@sotek.com',
        password: '',
        confirmPassword: '',
        roleIds: [1, 3],
        active: false,
      };

      const result = userSchema.safeParse(editUserData);
      expect(result.success).toBe(true);
    });

    it('should validate user edit with password change', () => {
      const editUserData = {
        name: 'Usuario Editado',
        email: 'editado@sotek.com',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
        roleIds: [1],
        active: true,
      };

      const result = userSchema.safeParse(editUserData);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined password correctly', () => {
      const data = {
        name: 'Test User',
        email: 'test@example.com',
        password: undefined,
        confirmPassword: undefined,
      };

      const result = userSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject only password without confirmation', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: '',
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should handle whitespace in name', () => {
      const validData = {
        name: '  Juan Pérez  ',
        email: 'juan@sotek.com',
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {};

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
