import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { OfertasDestacadas } from '../components/OfertasDestacadas';

const mk = (id, descuento) => ({ id, marca: 'M' + id, modelo: 'Modelo' + id, tipo: 'arabe', precio: 10000, descuento, imagenes: '/x.jpg' });

describe('components/OfertasDestacadas', () => {
  afterEach(cleanup);

  it('muestra como máximo 4 ofertas, las de mayor descuento primero', () => {
    const productos = [mk(1, 10), mk(2, 30), mk(3, 20), mk(4, 15), mk(5, 5), mk(6, 0)];
    render(<OfertasDestacadas productos={productos} onAgregar={() => {}} onVerDetalle={() => {}} onVerTodas={() => {}} />);
    const titulos = screen.getAllByRole('heading', { level: 5 }).map((h) => h.textContent);
    expect(titulos).toEqual(['Modelo2', 'Modelo3', 'Modelo4', 'Modelo1']);
  });

  it('el botón "Ver todas las ofertas" llama a onVerTodas', () => {
    const onVerTodas = jasmine.createSpy('onVerTodas');
    render(<OfertasDestacadas productos={[mk(1, 10)]} onAgregar={() => {}} onVerDetalle={() => {}} onVerTodas={onVerTodas} />);
    fireEvent.click(screen.getByRole('button', { name: /ver todas las ofertas/i }));
    expect(onVerTodas).toHaveBeenCalled();
  });

  it('no dibuja nada si no hay productos en oferta', () => {
    const { container } = render(<OfertasDestacadas productos={[mk(1, 0)]} onAgregar={() => {}} onVerDetalle={() => {}} onVerTodas={() => {}} />);
    expect(container.innerHTML).toBe('');
  });
});
