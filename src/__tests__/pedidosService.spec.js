import {
  calcularTotal,
  crearPedido,
  obtenerPedido,
  actualizarPedido,
  eliminarPedido,
  procesarPago,
} from '../service/pedidosService';

const items = [
  { id: 1, marca: 'Hawas', modelo: 'Malibu', imagenes: '/a.jpg', precio: 10000, cantidad: 2 },
  { id: 2, marca: 'Lattafa', nombre: 'Eclaire', imagenes: '/b.jpg', precio: 5000, cantidad: 1 },
];

describe('service/pedidosService', () => {
  beforeEach(() => localStorage.removeItem('pedidos_perfumes'));

  it('calcularTotal suma precio x cantidad de cada producto', () => {
    expect(calcularTotal(items)).toBe(25000);
  });

  it('crearPedido (CREATE) guarda un pedido pendiente con su total', () => {
    const pedido = crearPedido({ cliente: { nombre: 'Ana' }, envio: {}, items });
    expect(pedido.estado).toBe('pendiente');
    expect(pedido.total).toBe(25000);
    expect(obtenerPedido(pedido.id)).not.toBeNull(); // READ
  });

  it('actualizarPedido (UPDATE) modifica solo los campos indicados', () => {
    const pedido = crearPedido({ cliente: {}, envio: {}, items });
    const actualizado = actualizarPedido(pedido.id, { estado: 'pagado' });
    expect(actualizado.estado).toBe('pagado');
    expect(actualizado.total).toBe(25000);
  });

  it('eliminarPedido (DELETE) quita el pedido del almacenamiento', () => {
    const pedido = crearPedido({ cliente: {}, envio: {}, items });
    eliminarPedido(pedido.id);
    expect(obtenerPedido(pedido.id)).toBeNull();
  });

  describe('procesarPago (mock del reloj y de Math.random)', () => {
    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());

    it('marca el pedido como pagado cuando el sorteo es favorable', async () => {
      const pedido = crearPedido({ cliente: {}, envio: {}, items });
      spyOn(Math, 'random').and.returnValue(0.1); // 0.1 < 0.7 => éxito
      const promesa = procesarPago(pedido.id);
      jasmine.clock().tick(1500);
      const resultado = await promesa;
      expect(resultado.estado).toBe('pagado');
      expect(resultado.intentos).toBe(1);
    });

    it('marca el pedido como fallido cuando el sorteo es desfavorable', async () => {
      const pedido = crearPedido({ cliente: {}, envio: {}, items });
      spyOn(Math, 'random').and.returnValue(0.9); // 0.9 >= 0.7 => fallo
      const promesa = procesarPago(pedido.id);
      jasmine.clock().tick(1500);
      const resultado = await promesa;
      expect(resultado.estado).toBe('fallido');
    });
  });
});
