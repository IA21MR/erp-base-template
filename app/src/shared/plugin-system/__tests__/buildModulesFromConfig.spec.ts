// Test unitario: verifica que el builder resuelve dependencias e incluye core
// aunque no se pida explícitamente, y que respeta la desactivación de opcionales.
import {
  buildModulesFromConfig,
  resolveActiveManifests,
} from '../application/buildModulesFromConfig';

describe('buildModulesFromConfig', () => {
  it('debería incluir siempre los módulos core aunque no se listen', () => {
    const active = resolveActiveManifests([]);
    const names = active.map((m) => m.name);
    expect(names).toContain('auth');
    expect(names).toContain('users');
    // Opcionales NO deberían estar.
    expect(names).not.toContain('contacts');
    expect(names).not.toContain('organizations');
  });

  it('debería resolver dependencias transitivas (contacts -> users)', () => {
    const active = resolveActiveManifests(['contacts']);
    const names = active.map((m) => m.name);
    expect(names).toContain('contacts');
    expect(names).toContain('users'); // dep declarada
    // `users` debe aparecer antes que `contacts`.
    expect(names.indexOf('users')).toBeLessThan(names.indexOf('contacts'));
  });

  it('debería permitir activar solo un opcional sin el otro', () => {
    const active = resolveActiveManifests(['contacts']);
    const names = active.map((m) => m.name);
    expect(names).not.toContain('organizations');
  });

  it('buildModulesFromConfig debería devolver clases NestJS', () => {
    const classes = buildModulesFromConfig(['contacts']);
    expect(classes.length).toBeGreaterThan(0);
    classes.forEach((cls) => expect(typeof cls).toBe('function'));
  });

  it('debería lanzar si se pide un módulo inexistente', () => {
    expect(() => resolveActiveManifests(['no-existe'])).toThrow(
      /ModuleManifest no encontrado/,
    );
  });
});
