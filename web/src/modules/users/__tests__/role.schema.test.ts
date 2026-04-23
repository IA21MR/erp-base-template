/**
 * Tests unitarios para validación del schema de roles
 * Prueba las validaciones Zod del formulario de rol
 */

import { roleSchema, type RoleFormData } from '../application/validations/role.schema';

describe('Role Schema Validation', () => {
  describe('Valid role data', () => {
    it('should accept valid role data', () => {
      const validData: RoleFormData = {
        name: 'Administrador',
        permissionIds: [1, 2, 3],
      };

      const result = roleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept role with single permission', () => {
      const validData: RoleFormData = {
        name: 'Visor',
        permissionIds: [1],
      };

      const result = roleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept role with many permissions', () => {
      const validData: RoleFormData = {
        name: 'Super Admin',
        permissionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      };

      const result = roleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Name validation', () => {
    it('should reject name with less than 2 characters', () => {
      const invalidData = {
        name: 'A',
        permissionIds: [1],
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El nombre debe tener al menos 2 caracteres');
      }
    });

    it('should reject name with more than 50 characters', () => {
      const invalidData = {
        name: 'a'.repeat(51),
        permissionIds: [1],
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El nombre no puede exceder 50 caracteres');
      }
    });

    it('should accept name with exactly 2 characters', () => {
      const validData = {
        name: 'RH',
        permissionIds: [1],
      };

      const result = roleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept name with exactly 50 characters', () => {
      const validData = {
        name: 'a'.repeat(50),
        permissionIds: [1],
      };

      const result = roleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept name with special characters', () => {
      const validNames = [
        'Admin - Sistema',
        'Gerente/Supervisor',
        'Usuario_Básico',
        'Rol #1',
      ];

      validNames.forEach(name => {
        const data = {
          name,
          permissionIds: [1],
        };
        const result = roleSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept name with accents and ñ', () => {
      const validData = {
        name: 'Administración',
        permissionIds: [1],
      };

      const result = roleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('PermissionIds validation', () => {
    it('should reject empty permission array', () => {
      const invalidData = {
        name: 'Test Role',
        permissionIds: [],
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Debe seleccionar al menos un permiso');
      }
    });

    it('should reject missing permissionIds', () => {
      const invalidData = {
        name: 'Test Role',
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept sequential permission IDs', () => {
      const validData = {
        name: 'Full Access',
        permissionIds: [1, 2, 3, 4, 5],
      };

      const result = roleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept non-sequential permission IDs', () => {
      const validData = {
        name: 'Custom Role',
        permissionIds: [1, 5, 10, 15, 20],
      };

      const result = roleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept large permission IDs', () => {
      const validData = {
        name: 'Advanced Role',
        permissionIds: [100, 200, 300],
      };

      const result = roleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Common role scenarios', () => {
    it('should validate administrator role', () => {
      const adminRole = {
        name: 'Administrador',
        permissionIds: [1, 2, 3, 4, 5, 6, 7, 8],
      };

      const result = roleSchema.safeParse(adminRole);
      expect(result.success).toBe(true);
    });

    it('should validate viewer role', () => {
      const viewerRole = {
        name: 'Visor',
        permissionIds: [1, 5, 9], // Solo permisos de lectura
      };

      const result = roleSchema.safeParse(viewerRole);
      expect(result.success).toBe(true);
    });

    it('should validate editor role', () => {
      const editorRole = {
        name: 'Editor',
        permissionIds: [1, 2, 5, 6], // Lectura y escritura
      };

      const result = roleSchema.safeParse(editorRole);
      expect(result.success).toBe(true);
    });

    it('should validate custom limited role', () => {
      const customRole = {
        name: 'Operador Maquinaria',
        permissionIds: [9, 10], // Solo permisos específicos
      };

      const result = roleSchema.safeParse(customRole);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace in name', () => {
      const data = {
        name: '  Administrador  ',
        permissionIds: [1],
      };

      const result = roleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject null permissionIds', () => {
      const invalidData = {
        name: 'Test Role',
        permissionIds: null,
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject undefined permissionIds', () => {
      const invalidData = {
        name: 'Test Role',
        permissionIds: undefined,
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should handle duplicate permission IDs', () => {
      const data = {
        name: 'Test Role',
        permissionIds: [1, 1, 2, 2, 3],
      };

      // El schema no valida duplicados, solo que sea array de números
      const result = roleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing all required fields', () => {
      const invalidData = {};

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject permission IDs as strings', () => {
      const invalidData = {
        name: 'Test Role',
        permissionIds: ['1', '2', '3'],
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Validation error messages', () => {
    it('should provide clear error for short name', () => {
      const invalidData = {
        name: 'X',
        permissionIds: [1],
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find(issue => issue.path[0] === 'name');
        expect(nameError?.message).toContain('al menos 2 caracteres');
      }
    });

    it('should provide clear error for long name', () => {
      const invalidData = {
        name: 'X'.repeat(51),
        permissionIds: [1],
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find(issue => issue.path[0] === 'name');
        expect(nameError?.message).toContain('no puede exceder 50 caracteres');
      }
    });

    it('should provide clear error for empty permissions', () => {
      const invalidData = {
        name: 'Valid Name',
        permissionIds: [],
      };

      const result = roleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const permError = result.error.issues.find(issue => issue.path[0] === 'permissionIds');
        expect(permError?.message).toContain('al menos un permiso');
      }
    });
  });
});
