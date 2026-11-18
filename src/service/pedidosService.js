
// Copia temporal solo durante la navegación. Los pedidos se guardan en MySQL.
let pedidosCache = [];

// La simulación del pago ahora la realiza Spring Boot
export const PROBABILIDAD_EXITO = 0.7;

const leer = () => [...pedidosCache];
const guardar = (pedidos) => { pedidosCache = pedidos; };

// Calcular el total de los productos del carrito
export const calcularTotal = (items) =>
  items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

// Función auxiliar para comunicarse con Spring Boot
const solicitarAPI = async (ruta, opciones = {}) => {
  const respuesta = await fetch(ruta, opciones);

  const datos = await respuesta
    .json()
    .catch(() => null);

  if (!respuesta.ok) {
    throw new Error(
      datos?.error ||
      datos?.message ||
      `Error HTTP ${respuesta.status}`
    );
  }

  return datos;
};

// ---------- CONSULTAR PEDIDOS ----------

export const obtenerPedidos = () => leer();

export const obtenerPedido = (id) =>
  leer().find(
    (p) => String(p.id) === String(id)
  ) || null;

// ---------- CREAR PEDIDO EN MYSQL ----------

export const crearPedido = async ({ cliente, envio, items }) => {

  // Obtener el usuario que inició sesión
  const usuarioActual = JSON.parse(
    localStorage.getItem('usuario_actual') || 'null'
  );

  if (!usuarioActual?.id) {
    throw new Error(
      'Debes iniciar sesión con una cuenta registrada para comprar.'
    );
  }

  if (!items || items.length === 0) {
    throw new Error('El carrito está vacío.');
  }

  // Datos que espera CrearPedidoRequest.java
  const datosPedido = {
    usuarioId: Number(usuarioActual.id),
    cliente,
    envio,

    items: items.map((item) => ({
      id: Number(item.id),
      cantidad: Number(item.cantidad)
    }))
  };

  // Crear el pedido directamente en Spring Boot
  const respuesta = await solicitarAPI('/api/pedidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(datosPedido)
  });

  // Completar los datos necesarios para las pantallas de React
  const pedido = {
    id: respuesta.id,
    codigo: respuesta.codigo,
    fecha: respuesta.fecha,
    estado: respuesta.estado,
    intentos: 0,
    cliente,
    envio,

    items: items.map((item) => ({
      id: item.id,
      marca: item.marca,
      modelo: item.modelo || item.nombre,
      imagenes: item.imagenes,
      precio: item.precio,
      cantidad: item.cantidad
    })),

    // Usar el total calculado por el backend
    total: respuesta.total
  };

  // Conservar datos temporalmente para la boleta y posibles reintentos
  guardar([...leer(), pedido]);

  return pedido;
};

// ---------- ACTUALIZAR PEDIDO LOCAL ----------

// Copia temporal durante esta sesión de React. La administración real consulta MySQL.
export const actualizarPedido = (id, cambios) => {
  let actualizado = null;

  const pedidos = leer().map((p) => {
    if (String(p.id) !== String(id)) return p;

    actualizado = {
      ...p,
      ...cambios
    };

    return actualizado;
  });

  guardar(pedidos);

  return actualizado;
};

// ---------- ELIMINAR PEDIDO LOCAL ----------

// Elimina solo la copia temporal. Las órdenes reales están en MySQL.
export const eliminarPedido = (id) => {
  guardar(
    leer().filter(
      (p) => String(p.id) !== String(id)
    )
  );
};

// ---------- PROCESAR PAGO EN MYSQL ----------

export const procesarPago = async (id) => {

  const pedidoAnterior = obtenerPedido(id);

  if (!pedidoAnterior) {
    throw new Error('No se encontró el pedido.');
  }

  // Spring Boot simula el pago y actualiza MySQL
  const respuesta = await solicitarAPI(
    `/api/pedidos/${id}/pago`,
    {
      method: 'POST'
    }
  );

  // Mantener los datos de cliente, envío y productos
  const pedidoActualizado = {
    ...pedidoAnterior,
    ...respuesta
  };

  // Actualizar la copia local con el resultado del backend
  guardar(
    leer().map((p) =>
      String(p.id) === String(id)
        ? pedidoActualizado
        : p
    )
  );

  return pedidoActualizado;
};
