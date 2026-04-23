/**
 * Tests para el componente ForgotPasswordForm
 * Prueba el flujo de recuperación de contraseña
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '../presentation/components/ForgotPasswordForm';
import { useForgotPassword } from '../presentation/hooks/useForgotPassword';

// Mock del hook useForgotPassword
jest.mock('../presentation/hooks/useForgotPassword', () => ({
  useForgotPassword: jest.fn(),
}));

describe('ForgotPasswordForm', () => {
  const mockSendCode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useForgotPassword as jest.Mock).mockReturnValue({
      sendCode: mockSendCode,
      isLoading: false,
      error: null,
      success: false,
    });
  });

  it('should render forgot password form correctly', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByText(/olvidaste tu contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar código/i })).toBeInTheDocument();
  });

  it('should update email input value', () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'admin@sotek.com' } });

    expect(emailInput.value).toBe('admin@sotek.com');
  });

  it('should call sendCode on form submit', async () => {
    mockSendCode.mockResolvedValue(undefined);

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar código/i });

    fireEvent.change(emailInput, { target: { value: 'admin@sotek.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSendCode).toHaveBeenCalledWith({
        email: 'admin@sotek.com',
      });
    });
  });

  it('should disable form when loading', () => {
    (useForgotPassword as jest.Mock).mockReturnValue({
      sendCode: mockSendCode,
      isLoading: true,
      error: null,
      success: false,
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button') as HTMLButtonElement;

    expect(emailInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
  });

  it('should show success message after sending code', async () => {
    mockSendCode.mockResolvedValue(undefined);
    (useForgotPassword as jest.Mock).mockReturnValue({
      sendCode: mockSendCode,
      isLoading: false,
      error: null,
      success: true,
    });

    render(<ForgotPasswordForm />);

    // Verificar que muestra el mensaje de éxito
    expect(screen.getByText(/código enviado/i)).toBeInTheDocument();
    expect(screen.getByText(/revisa tu correo electrónico/i)).toBeInTheDocument();
  });

  it('should display error message when request fails', () => {
    const errorMessage = 'Correo no encontrado';
    (useForgotPassword as jest.Mock).mockReturnValue({
      sendCode: mockSendCode,
      isLoading: false,
      error: errorMessage,
      success: false,
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should require email field', () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i) as HTMLInputElement;
    expect(emailInput.required).toBe(true);
  });

  it('should have email input type', () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i) as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });
});
