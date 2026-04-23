/**
 * Página: Restablecer contraseña
 * Ruta: /reset-password
 * Flujo completo: Solicitar código → Verificar código → Cambiar contraseña
 */
'use client';

import { useState } from 'react';
import { ForgotPasswordForm } from '@/modules/auth/presentation/components/ForgotPasswordForm';
import { VerifyCodeForm } from '@/modules/auth/presentation/components/VerifyCodeForm';
import { ResetPasswordForm } from '@/modules/auth/presentation/components/ResetPasswordForm';

type Step = 'request-code' | 'verify-code' | 'reset-password';

export default function ResetPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>('request-code');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleCodeSent = (userEmail: string) => {
    setEmail(userEmail);
    setCurrentStep('verify-code');
  };

  const handleCodeVerified = (userEmail: string, verifiedCode: string) => {
    setEmail(userEmail);
    setCode(verifiedCode);
    setCurrentStep('reset-password');
  };

  const handleResendCode = () => {
    setCurrentStep('request-code');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'request-code' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-600'
              } font-semibold`}>
                1
              </div>
              <span className="text-xs mt-2 text-gray-600">Solicitar</span>
            </div>
            <div className={`flex-1 h-1 ${
              currentStep !== 'request-code' ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'verify-code' 
                  ? 'bg-green-600 text-white' 
                  : currentStep === 'reset-password'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-200 text-gray-400'
              } font-semibold`}>
                2
              </div>
              <span className="text-xs mt-2 text-gray-600">Verificar</span>
            </div>
            <div className={`flex-1 h-1 ${
              currentStep === 'reset-password' ? 'bg-green-600' : 'bg-gray-200'
            }`}></div>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 'reset-password' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-400'
              } font-semibold`}>
                3
              </div>
              <span className="text-xs mt-2 text-gray-600">Cambiar</span>
            </div>
          </div>
        </div>

        {/* Formularios según el paso */}
        {currentStep === 'request-code' && (
          <ForgotPasswordForm onSuccess={handleCodeSent} />
        )}

        {currentStep === 'verify-code' && (
          <VerifyCodeForm 
            email={email} 
            onSuccess={handleCodeVerified}
            onResend={handleResendCode}
          />
        )}

        {currentStep === 'reset-password' && (
          <ResetPasswordForm email={email} code={code} />
        )}
      </div>
    </main>
  );
}
