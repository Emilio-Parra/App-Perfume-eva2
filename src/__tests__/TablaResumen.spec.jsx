import { render, screen, cleanup } from '@testing-library/react';
import { TablaResumen } from '../components/TablaResumen';

describe('components/TablaResumen', () => {
  afterEach(cleanup);

  it('dibuja una fila por producto con su subtotal', () => {
    const items = [
      { id: 1, marca: 'Hawas', modelo: 'Malibu', imagenes: '/a.jpg', precio: 10000, cantidad: 2 },
      { id: 2, marca: 'Lattafa', nombre: 'Eclaire', imagenes: '/b.jpg', precio: 5000, cantidad: 1 },
    ];
    render(<TablaResumen items={items} />);

    expect(screen.getAllByRole('row').length).toBe(3); // encabezado + 2 productos
    expect(screen.getByText('$20.000')).toBeTruthy(); // 10.000 x 2
    expect(screen.getByText('Eclaire')).toBeTruthy(); // usa "nombre" si no hay "modelo"
  });
});
