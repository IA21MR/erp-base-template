// Teardown global para tests E2E
// Este archivo se ejecuta una vez después de todos los tests

export default async () => {
  // Forzar limpieza de conexiones pendientes
  // Dar tiempo a que las conexiones se cierren gracefully
  await new Promise((resolve) => setTimeout(resolve, 100));
};
