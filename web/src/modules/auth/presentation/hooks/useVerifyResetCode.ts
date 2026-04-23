/**
 * Hook personalizado para verificar código de restablecimiento
 */
'use client';

import { useState } from 'react';
import { VerifyResetCodeDTO } from '../../application/dtos/VerifyResetCode.dto';
import { verifyResetCodeUseCase } from '../../infrastructure/di/AuthContainer';

export interface UseVerifyResetCodeResult {
  verifyCode: (data: VerifyResetCodeDTO) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  isValid: boolean | null;
}

export function useVerifyResetCode(): UseVerifyResetCodeResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const verifyCode = async (data: VerifyResetCodeDTO): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setIsValid(null);

    try {
      const result = await verifyResetCodeUseCase.execute(data);
      setIsValid(result.isValid);
      return result.isValid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al verificar el código';
      setError(errorMessage);
      setIsValid(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    verifyCode,
    isLoading,
    error,
    isValid,
  };
}
