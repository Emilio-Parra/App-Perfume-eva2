import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { LoginPage } from '../components/LoginPage';

const usuario = { correo: 'ana@duoc.cl', pass: 'abcd', nombre: 'Ana' };

const escribir = (correo, pass) => {
  fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: correo } });
  fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: pass } });
  fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
};

describe('components/LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('usuarios_perfumes', JSON.stringify([usuario]));
  });
  afterEach(cleanup);

  it('muestra error si el correo no tiene un dominio permitido', () => {
    render(<LoginPage />);
    escribir('ana@hotmail.com', 'abcd');
    expect(screen.getByText(/solo se permiten correos/i)).toBeTruthy();
  });

  it('muestra error si la contraseña tiene menos de 4 caracteres', () => {
    render(<LoginPage />);
    escribir('ana@duoc.cl', 'ab');
    expect(screen.getByText(/entre 4 y 10 caracteres/i)).toBeTruthy();
  });

  it('muestra error general si las credenciales no coinciden', () => {
    render(<LoginPage />);
    escribir('ana@duoc.cl', 'clavemala');
    expect(screen.getByText(/correo o contraseña incorrectos/i)).toBeTruthy();
  });

  it('con credenciales correctas guarda la sesión y avisa el éxito', () => {
    jasmine.clock().install();
    const onLoginSuccess = jasmine.createSpy('onLoginSuccess');
    render(<LoginPage onLoginSuccess={onLoginSuccess} />);
    escribir('ana@duoc.cl', 'abcd');

    expect(screen.getByText(/sesión iniciada con éxito/i)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('usuario_actual')).correo).toBe('ana@duoc.cl');
    jasmine.clock().tick(1200);
    expect(onLoginSuccess).toHaveBeenCalledOnceWith(usuario);
    jasmine.clock().uninstall();
  });
});
