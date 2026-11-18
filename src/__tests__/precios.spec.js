import { enOferta, porcentajeDescuento, precioFinal } from '../utils/precios';

describe('utils/precios', () => {
  it('precioFinal aplica el porcentaje de descuento y redondea', () => {
    expect(precioFinal({ precio: 39990, descuento: 20 })).toBe(31992);
    expect(precioFinal({ precio: 69120, descuento: 10 })).toBe(62208);
  });

  it('sin descuento (o inválido) el precio final es el precio normal', () => {
    expect(precioFinal({ precio: 50000 })).toBe(50000);
    expect(precioFinal({ precio: 50000, descuento: 0 })).toBe(50000);
    expect(precioFinal({ precio: 50000, descuento: 'abc' })).toBe(50000);
  });

  it('enOferta es verdadero solo cuando hay descuento mayor a 0', () => {
    expect(enOferta({ descuento: 15 })).toBeTrue();
    expect(enOferta({ descuento: 0 })).toBeFalse();
    expect(enOferta({})).toBeFalse();
  });

  it('el descuento se limita a un máximo de 90%', () => {
    expect(porcentajeDescuento({ descuento: 150 })).toBe(90);
  });
});
