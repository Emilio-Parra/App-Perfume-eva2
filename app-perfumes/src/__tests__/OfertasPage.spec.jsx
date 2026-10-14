import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { OfertasPage } from '../components/OfertasPage';

const productos = [
  { id: 1, marca: 'Hawas', modelo: 'Malibu', tipo: 'arabe', precio: 40000, descuento: 10, imagenes: '/a.jpg' },
  { id: 2, marca: 'Lattafa', modelo: 'Khamrah', tipo: 'arabe', precio: 70000, descuento: 0, imagenes: '/b.jpg' },
  { id: 3, marca: 'Armaf', modelo: 'Untold', tipo: 'arabe', precio: 40000, descuento: 30, imagenes: '/c.jpg' },
];

describe('components/OfertasPage', () => {
  afterEach(cleanup);

  it('muestra solo los productos con descuento', () => {
    render(<OfertasPage productos={productos} onAgregar={() => {}} onVerDetalle={() => {}} />);
    expect(screen.getByText('Malibu')).toBeTruthy();
    expect(screen.getByText('Untold')).toBeTruthy();
    expect(screen.queryByText('Khamrah')).toBeNull();
    expect(screen.getByText('2 ofertas')).toBeTruthy();
  });

  it('ordena por mayor descuento por defecto y por menor precio al cambiar el orden', () => {
    render(<OfertasPage productos={productos} onAgregar={() => {}} onVerDetalle={() => {}} />);
    const titulos = () => screen.getAllByRole('heading', { level: 5 }).map((h) => h.textContent);
    expect(titulos()).toEqual(['Untold', 'Malibu']); // 30% antes que 10%

    fireEvent.change(screen.getByLabelText(/ordenar por/i), { target: { value: 'precio-desc' } });
    expect(titulos()).toEqual(['Malibu', 'Untold']); // 36.000 > 28.000
  });

  it('muestra un mensaje cuando no hay ofertas', () => {
    render(<OfertasPage productos={[productos[1]]} onAgregar={() => {}} onVerDetalle={() => {}} />);
    expect(screen.getByText(/no hay ofertas disponibles/i)).toBeTruthy();
  });

  it('el botón añadir llama a onAgregar con el producto en oferta', () => {
    const onAgregar = jasmine.createSpy('onAgregar');
    render(<OfertasPage productos={[productos[0]]} onAgregar={onAgregar} onVerDetalle={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(onAgregar).toHaveBeenCalledOnceWith(productos[0]);
  });
});
