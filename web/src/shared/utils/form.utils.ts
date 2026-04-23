/**
 * Utilidades compartidas para manejo de formularios
 * @module shared/utils/form.utils
 */

/**
 * Extrae solo los campos modificados de un formulario usando dirtyFields de React Hook Form.
 * Útil para implementar PATCH semántico - enviar solo campos realmente modificados.
 *
 * @example
 * ```tsx
 * const { formState: { dirtyFields } } = useForm();
 *
 * const onSubmit = (data: FormData) => {
 *   const changedFields = extractDirtyFields(data, dirtyFields);
 *   // changedFields solo contiene campos que el usuario modificó
 *   await updateCustomer(id, changedFields);
 * };
 * ```
 *
 * @param formData - Todos los datos del formulario
 * @param dirtyFields - Objeto de dirtyFields de React Hook Form (formState.dirtyFields)
 * @returns Objeto con solo los campos que fueron modificados
 */
export function extractDirtyFields<T extends Record<string, unknown>>(
  formData: T,
  dirtyFields: Partial<Record<keyof T, boolean | object>>
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(dirtyFields) as Array<keyof T>) {
    const isDirty = dirtyFields[key];
    if (isDirty === true || (typeof isDirty === 'object' && isDirty !== null)) {
      result[key] = formData[key];
    }
  }

  return result;
}

/**
 * Verifica si un formulario tiene campos modificados
 *
 * @param dirtyFields - Objeto de dirtyFields de React Hook Form
 * @returns true si hay al menos un campo modificado
 */
export function hasChangedFields(
  dirtyFields: Record<string, boolean | object | undefined>
): boolean {
  return Object.keys(dirtyFields).length > 0;
}

/**
 * Lista los nombres de los campos que fueron modificados
 *
 * @param dirtyFields - Objeto de dirtyFields de React Hook Form
 * @returns Array con los nombres de los campos modificados
 */
export function getChangedFieldNames(
  dirtyFields: Record<string, boolean | object | undefined>
): string[] {
  return Object.keys(dirtyFields).filter(key => {
    const value = dirtyFields[key];
    return value === true || (typeof value === 'object' && value !== null);
  });
}
