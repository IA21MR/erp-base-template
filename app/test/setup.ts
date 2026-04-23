// Setup global para tests E2E
// Este archivo se ejecuta antes de cada test suite

// Incrementar timeout por defecto para tests E2E
jest.setTimeout(30000);

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
