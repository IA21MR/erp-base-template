/**
 * Result<T, E>
 * 
 * Patrón Result para manejo explícito de éxitos y errores sin excepciones.
 * Inspirado en Rust y programación funcional.
 * 
 * Ventajas:
 * - Type-safe: El tipo indica qué errores pueden ocurrir
 * - Explícito: No hay sorpresas de excepciones no manejadas
 * - Composable: Fácil de encadenar operaciones
 * 
 * @example
 * // En casos de uso
 * async execute(id: string): Promise<Result<Machine, MachineNotFoundException>> {
 *   const machine = await this.repository.findById(id);
 *   if (!machine) {
 *     return Result.fail(new MachineNotFoundException(id));
 *   }
 *   return Result.ok(machine);
 * }
 * 
 * // En controladores
 * const result = await this.useCase.execute(id);
 * if (result.isFailure()) {
 *   throw new NotFoundException(result.getError().message);
 * }
 * return result.getValue();
 */
export class Result<T, E = Error> {
  private constructor(
    private readonly success: boolean,
    private readonly value?: T,
    private readonly error?: E,
  ) {}

  /**
   * Crea un Result exitoso con un valor
   */
  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  /**
   * Crea un Result fallido con un error
   */
  static fail<T = never, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  /**
   * Verifica si el resultado es exitoso
   */
  isSuccess(): boolean {
    return this.success;
  }

  /**
   * Verifica si el resultado es un fallo
   */
  isFailure(): boolean {
    return !this.success;
  }

  /**
   * Obtiene el valor (solo si es exitoso)
   * @throws Error si se llama en un resultado fallido
   */
  getValue(): T {
    if (!this.success) {
      throw new Error('Cannot get value from a failed result');
    }
    return this.value!;
  }

  /**
   * Obtiene el error (solo si es fallido)
   * @throws Error si se llama en un resultado exitoso
   */
  getError(): E {
    if (this.success) {
      throw new Error('Cannot get error from a successful result');
    }
    return this.error!;
  }

  /**
   * Transforma el valor si el resultado es exitoso
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.success) {
      return Result.ok(fn(this.value!));
    }
    return Result.fail(this.error!);
  }

  /**
   * Transforma el error si el resultado es fallido
   */
  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (!this.success) {
      return Result.fail(fn(this.error!));
    }
    return Result.ok(this.value!);
  }

  /**
   * Ejecuta una función dependiendo del resultado
   */
  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    if (this.success) {
      return onSuccess(this.value!);
    }
    return onFailure(this.error!);
  }
}
