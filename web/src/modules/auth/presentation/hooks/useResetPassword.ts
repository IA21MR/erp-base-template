/**
 * Hook personalizado para restablecer contraseña
 */
'use client';

import { useState } from 'react';
import { ResetPasswordDTO } from '../../application/dtos/ResetPassword.dto';
import { resetPasswordUseCase } from '../../infrastructure/di/AuthContainer';

export interface UseResetPasswordResult {
  resetPassword: (data: ResetPasswordDTO) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useResetPassword(): UseResetPasswordResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (data: ResetPasswordDTO) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await resetPasswordUseCase.execute(data);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al restablecer la contraseña';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    isLoading,
    error,
    success,
  };
}
