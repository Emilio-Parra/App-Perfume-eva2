import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { RegistroPage } from '../components/RegistroPage';

describe('components/RegistroPage', () => {
  let fetchOriginal;

  beforeEach(() => {
    localStorage.clear();
    // Mock de fetch: simula comunas-regiones.json sin salir a la red
    fetchOriginal = window.fetch;
    window.fetch = jasmine.createSpy('fetch').and.resolveTo({
      json: () => Promise.resolve([{ region: 'Metropolitana', comunas: ['Santiago', 'Maipú'] }]),
    });
  });
  afterEach(() => {
    cleanup();
    window.fetch = fetchOriginal; // se restaura el fetch real
  });

  it('carga las regiones desde el JSON usando fetch', async () => {
    render(<RegistroPage />);
    await waitFor(() => expect(screen.getByRole('option', { name: 'Metropolitana' })).toBeTruthy());
    expect(window.fetch).toHaveBeenCalledWith('/data/comunas-regiones.json');
  });

  it('al enviar el formulario vacío muestra los mensajes de validación', async () => {
    render(<RegistroPage />);
    await waitFor(() => screen.getByRole('option', { name: 'Metropolitana' }));
    fireEvent.click(screen.getByRole('button', { name: /registr|crear/i }));

    expect(screen.getByText('El RUN es obligatorio.')).toBeTruthy();
    expect(screen.getByText('Debes seleccionar una región.')).toBeTruthy();
    expect(localStorage.getItem('usuarios_perfumes')).toBeNull(); // no se guardó nada
  });

  it('rechaza un RUN con dígito verificador inválido', async () => {
    render(<RegistroPage />);
    await waitFor(() => screen.getByRole('option', { name: 'Metropolitana' }));
    fireEvent.change(screen.getByLabelText(/RUN/i), { target: { value: '123456786' } });
    fireEvent.click(screen.getByRole('button', { name: /registr|crear/i }));
    expect(screen.getByText(/El RUN no es válido/i)).toBeTruthy();
  });
});
