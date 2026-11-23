
import {
  calcularTotal,
  crearPedido,
  obtenerPedidos,
  obtenerPedido,
  actualizarPedido,
  eliminarPedido,
  procesarPago,
} from '../service/pedidosService';

const items = [
  {
    id: 1,
    marca: 'Hawas',
    modelo: 'Malibu',
    imagenes: '/a.jpg',
    precio: 10000,
    cantidad: 2,
  },
  {
    id: 2,
    marca: 'Lattafa',
    nombre: 'Eclaire',
    imagenes: '/b.jpg',
    precio: 5000,
    cantidad: 1,
  },
];

const cliente = {
  nombre: 'Ana',
  correo: 'ana@duoc.cl',
};

const envio = {
  direccion: 'Santiago',
};

const respuestaOK = (datos) => ({
  ok: true,
  status: 200,
  json: async () => datos,
});

const pedidoBackend = (cambios = {}) => ({
  id: 101,
  codigo: 'ORDER101',
  fecha: '2026-11-22T12:00:00',
  estado: 'pendiente',
  total: 24900,
  ...cambios,
});

const crearPedidoPrueba = () =>
  crearPedido({ cliente, envio, items });

describe('service/pedidosService - Spring Boot y MySQL', () => {
  let fetchOriginal;

  beforeEach(() => {
    fetchOriginal = window.fetch;

    // Simular un cliente autenticado sin utilizar cuentas reales.
    localStorage.setItem(
      'usuario_actual',
      JSON.stringify({
        id: 7,
        correo: 'ana@duoc.cl',
        nombre: 'Ana',
        rol: 'cliente',
        token: 'jwt-de-prueba',
      })
    );

    // Limpiar únicamente la caché temporal de pedidos.
    obtenerPedidos().forEach((pedido) => {
      eliminarPedido(pedido.id);
    });

    // Simular la respuesta de Spring Boot.
    window.fetch = jasmine
      .createSpy('fetch')
      .and.returnValue(
        Promise.resolve(respuestaOK(pedidoBackend()))
      );
  });

  afterEach(() => {
    window.fetch = fetchOriginal;
    localStorage.removeItem('usuario_actual');

    obtenerPedidos().forEach((pedido) => {
      eliminarPedido(pedido.id);
    });
  });

  it('calcularTotal suma precio por cantidad', () => {
    expect(calcularTotal(items)).toBe(25000);
  });

  it('rechaza compras de usuarios sin sesión', async () => {
    localStorage.removeItem('usuario_actual');

    await expectAsync(
      crearPedidoPrueba()
    ).toBeRejectedWithError(
      'Debes iniciar sesión con una cuenta registrada para comprar.'
    );

    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('rechaza pedidos con el carrito vacío', async () => {
    await expectAsync(
      crearPedido({
        cliente,
        envio,
        items: [],
      })
    ).toBeRejectedWithError('El carrito está vacío.');

    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('crearPedido envía un POST a Spring Boot', async () => {
    const pedido = await crearPedidoPrueba();

    expect(pedido.id).toBe(101);
    expect(pedido.codigo).toBe('ORDER101');
    expect(pedido.estado).toBe('pendiente');

    // El total oficial es el devuelto por MySQL/Spring Boot.
    expect(pedido.total).toBe(24900);

    expect(obtenerPedido(101)).not.toBeNull();

    expect(window.fetch).toHaveBeenCalledWith(
      '/api/pedidos',
      jasmine.objectContaining({
        method: 'POST',
      })
    );

    const llamada = window.fetch.calls.mostRecent();
    const cuerpo = JSON.parse(llamada.args[1].body);

    expect(cuerpo.usuarioId).toBe(7);
    expect(cuerpo.cliente.nombre).toBe('Ana');
    expect(cuerpo.items).toEqual([
      { id: 1, cantidad: 2 },
      { id: 2, cantidad: 1 },
    ]);

    // El navegador no debe fijar el precio de la compra.
    expect(cuerpo.items[0].precio).toBeUndefined();
  });

  it('actualizarPedido modifica la copia temporal', async () => {
    const pedido = await crearPedidoPrueba();

    const actualizado = actualizarPedido(pedido.id, {
      estado: 'pagado',
    });

    expect(actualizado.estado).toBe('pagado');
    expect(actualizado.total).toBe(24900);

    expect(obtenerPedido(pedido.id).estado).toBe('pagado');

    // Actualizar la copia local no genera otra petición.
    expect(window.fetch).toHaveBeenCalledTimes(1);
  });

  it('eliminarPedido elimina únicamente la copia temporal', async () => {
    const pedido = await crearPedidoPrueba();

    eliminarPedido(pedido.id);

    expect(obtenerPedido(pedido.id)).toBeNull();
    expect(obtenerPedidos().length).toBe(0);

    // No elimina pedidos reales de MySQL.
    expect(window.fetch).toHaveBeenCalledTimes(1);
  });

  it('procesarPago registra un pago aprobado por Spring Boot', async () => {
    window.fetch.and.returnValues(
      Promise.resolve(respuestaOK(pedidoBackend())),
      Promise.resolve(
        respuestaOK({
          estado: 'pagado',
          intentos: 1,
          total: 24900,
        })
      )
    );

    const pedido = await crearPedidoPrueba();
    const resultado = await procesarPago(pedido.id);

    expect(resultado.estado).toBe('pagado');
    expect(resultado.intentos).toBe(1);
    expect(resultado.total).toBe(24900);

    expect(obtenerPedido(pedido.id).estado).toBe('pagado');

    expect(window.fetch).toHaveBeenCalledWith(
      '/api/pedidos/101/pago',
      jasmine.objectContaining({
        method: 'POST',
      })
    );
  });

  it('procesarPago registra un pago rechazado por Spring Boot', async () => {
    window.fetch.and.returnValues(
      Promise.resolve(respuestaOK(pedidoBackend())),
      Promise.resolve(
        respuestaOK({
          estado: 'fallido',
          intentos: 1,
        })
      )
    );

    const pedido = await crearPedidoPrueba();
    const resultado = await procesarPago(pedido.id);

    expect(resultado.estado).toBe('fallido');
    expect(obtenerPedido(pedido.id).estado).toBe('fallido');
  });

  it('procesarPago rechaza pedidos inexistentes', async () => {
    await expectAsync(
      procesarPago(999)
    ).toBeRejectedWithError(
      'No se encontró el pedido.'
    );

    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('propaga los errores de Spring Boot al crear pedidos', async () => {
    window.fetch.and.returnValue(
      Promise.resolve({
        ok: false,
        status: 409,
        json: async () => ({
          error: 'Stock insuficiente.',
        }),
      })
    );

    await expectAsync(
      crearPedidoPrueba()
    ).toBeRejectedWithError('Stock insuficiente.');

    expect(obtenerPedidos().length).toBe(0);
  });
});
