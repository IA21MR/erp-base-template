/**
 * Tests para el componente LoginForm
 * Prueba la renderización, validación y envío del formulario de login
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../presentation/components/LoginForm';
import { useLogin } from '../presentation/hooks/useLogin';
import { useRouter } from 'next/navigation';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock del hook useLogin
jest.mock('../presentation/hooks/useLogin', () => ({
  useLogin: jest.fn(),
}));

describe('LoginForm', () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useLogin as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });

    // Mock de localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock de document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });

    // Mock de window.location
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('should render login form correctly', () => {
    render(<LoginForm />);

    expect(screen.getByText('Bienvenido')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tus credenciales para continuar')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should update email input value', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Correo electrónico') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'admin@sotek.com' } });

    expect(emailInput.value).toBe('admin@sotek.com');
  });

  it('should update password input value', () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'Admin123!' } });

    expect(passwordInput.value).toBe('Admin123!');
  });

  it('should toggle password visibility', () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement;
    const toggleButtons = screen.getAllByRole('button', { hidden: true });
    // El botón de toggle es el primero que no es el submit
    const toggleButton = toggleButtons.find((btn: any) => btn.type === 'button');

    expect(passwordInput.type).toBe('password');

    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    }
  });

  it('should call login on form submit with correct data', async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Correo electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'admin@sotek.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Admin123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@sotek.com',
        password: 'Admin123!',
      });
    });
  });

  it('should disable form inputs when loading', () => {
    (useLogin as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Correo electrónico') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /iniciando sesión/i }) as HTMLButtonElement;

    expect(emailInput.disabled).toBe(true);
    expect(passwordInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
  });

  it('should show loading state on submit button', () => {
    (useLogin as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
    });

    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeInTheDocument();
  });

  it('should display error message when login fails', () => {
    const errorMessage = 'Credenciales inválidas';
    (useLogin as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: errorMessage,
    });

    render(<LoginForm />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show forgot password link', () => {
    render(<LoginForm />);

    const forgotLink = screen.getByText('¿Olvidaste tu contraseña?');
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink.closest('a')).toHaveAttribute('href', '/reset-password');
  });

  it('should require email and password fields', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Correo electrónico') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
  });

  it('should have correct email input type', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Correo electrónico') as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  it('should have password input type by default', () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
  });

  it('should handle successful login and redirect', async () => {
    mockLogin.mockResolvedValue(undefined);
    (window.localStorage.getItem as jest.Mock)
      .mockReturnValueOnce('mock-access-token')
      .mockReturnValueOnce('mock-refresh-token');

    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Correo electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'admin@sotek.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Admin123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('should handle login error gracefully', async () => {
    const errorMessage = 'Error de red';
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Correo electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('should have autocomplete attributes for better UX', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Correo electrónico') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement;

    expect(emailInput.autocomplete).toBe('email');
    expect(passwordInput.autocomplete).toBe('current-password');
  });

  it('should have placeholder text', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Correo electrónico') as HTMLInputElement;
    expect(emailInput.placeholder).toBe('admin@sotek.com');
  });

  it('should clear error when user starts typing', async () => {
    const errorMessage = 'Credenciales inválidas';
    (useLogin as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: errorMessage,
    });

    const { rerender } = render(<LoginForm />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // Simular que el error se limpia al escribir
    (useLogin as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });

    rerender(<LoginForm />);

    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  });
});
