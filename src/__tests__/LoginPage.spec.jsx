
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from '@testing-library/react';

import { LoginPage } from '../components/LoginPage';

const usuarioBackend = {
  id: 7,
  correo: 'ana@duoc.cl',
  nombre: 'Ana',
  apellido: 'Prueba',
  rol: 'cliente',
  token: 'jwt-falso-para-pruebas',
  refreshToken: 'refresh-falso-para-pruebas',
};

const escribir = (correo, pass) => {
  fireEvent.change(
    screen.getByLabelText(/correo electrónico/i),
    { target: { value: correo } }
  );

  fireEvent.change(
    screen.getByLabelText(/contraseña/i),
    { target: { value: pass } }
  );

  fireEvent.click(
    screen.getByRole('button', { name: /iniciar sesión/i })
  );
};

describe('components/LoginPage - autenticación con Spring Boot', () => {
  let fetchOriginal;

  beforeEach(() => {
    fetchOriginal = window.fetch;
    localStorage.removeItem('usuario_actual');
    window.fetch = jasmine.createSpy('fetch');
  });

  afterEach(() => {
    cleanup();
    window.fetch = fetchOriginal;
    localStorage.removeItem('usuario_actual');
  });

  it('muestra error si el correo no tiene un dominio permitido', () => {
    render(<LoginPage />);

    escribir('ana@hotmail.com', 'abcd');

    expect(
      screen.getByText(/solo se permiten correos/i)
    ).toBeTruthy();

    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('muestra error si la contraseña tiene menos de 4 caracteres', () => {
    render(<LoginPage />);

    escribir('ana@duoc.cl', 'ab');

    expect(
      screen.getByText(/entre 4 y 10 caracteres/i)
    ).toBeTruthy();

    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('muestra error si las credenciales no coinciden', async () => {
    window.fetch.and.resolveTo({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'Correo o contraseña incorrectos.',
      }),
    });

    render(<LoginPage />);

    escribir('ana@duoc.cl', 'clavemala');

    expect(
      await screen.findByText(/correo o contraseña incorrectos/i)
    ).toBeTruthy();

    expect(window.fetch).toHaveBeenCalledWith(
      '/api/usuarios/login',
      jasmine.objectContaining({
        method: 'POST',
      })
    );

    expect(localStorage.getItem('usuario_actual')).toBeNull();
  });

  it('con credenciales correctas guarda JWT y mantiene la sesión', async () => {
    window.fetch.and.resolveTo({
      ok: true,
      status: 200,
      json: async () => usuarioBackend,
    });

    const onLoginSuccess = jasmine.createSpy('onLoginSuccess');

    jasmine.clock().install();

    try {
      render(
        <LoginPage onLoginSuccess={onLoginSuccess} />
      );

      await act(async () => {
        escribir('ana@duoc.cl', 'abcd');
      });

      expect(
        screen.getByText(/sesión iniciada con éxito/i)
      ).toBeTruthy();

      const sesionGuardada = JSON.parse(
        localStorage.getItem('usuario_actual') || 'null'
      );

      expect(sesionGuardada).toEqual(
        jasmine.objectContaining({
          id: 7,
          correo: 'ana@duoc.cl',
          rol: 'cliente',
          token: 'jwt-falso-para-pruebas',
          refreshToken: 'refresh-falso-para-pruebas',
        })
      );

      expect(window.fetch).toHaveBeenCalledWith(
        '/api/usuarios/login',
        jasmine.objectContaining({
          method: 'POST',
        })
      );

      // Simular los 1200 ms de espera del login.
      jasmine.clock().tick(1201);

      expect(onLoginSuccess).toHaveBeenCalledOnceWith(
        usuarioBackend
      );
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
