import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ProductoCard } from '../components/ProductoCard';

const producto = {
  id: 6, marca: 'Lattafa', modelo: 'Khamrah', tipo: 'arabe', precio: 69990, imagenes: '/img/x.jpg',
};

describe('components/ProductoCard', () => {
  let onAgregar;
  let onVerDetalle;

  beforeEach(() => {
    onAgregar = jasmine.createSpy('onAgregar');
    onVerDetalle = jasmine.createSpy('onVerDetalle');
    render(<ProductoCard producto={producto} onAgregar={onAgregar} onVerDetalle={onVerDetalle} />);
  });
  afterEach(cleanup);

  it('muestra marca, modelo, categoría y precio formateado', () => {
    expect(screen.getByText('Khamrah')).toBeTruthy();
    expect(screen.getByText('Lattafa')).toBeTruthy();
    expect(screen.getByText('arabe')).toBeTruthy();
    expect(screen.getByText('$69.990')).toBeTruthy();
  });

  it('al presionar "Añadir al carrito" llama a onAgregar con el producto', () => {
    fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(onAgregar).toHaveBeenCalledOnceWith(producto);
    expect(onVerDetalle).not.toHaveBeenCalled();
  });

  it('al hacer clic en el título abre el detalle del producto', () => {
    fireEvent.click(screen.getByText('Khamrah'));
    expect(onVerDetalle).toHaveBeenCalledOnceWith(producto);
  });

  it('si el producto tiene descuento muestra la etiqueta, el precio tachado y el precio final', () => {
    cleanup();
    render(<ProductoCard producto={{ ...producto, descuento: 20 }} onAgregar={onAgregar} onVerDetalle={onVerDetalle} />);
    expect(screen.getByText('-20%')).toBeTruthy();
    expect(screen.getByText('$69.990')).toBeTruthy(); // precio original tachado
    expect(screen.getByText('$55.992')).toBeTruthy(); // precio con descuento
  });
});
