// Fuente de datos simulada para los pedidos (persistencia en localStorage).
// Incluye el CRUD básico (crear, leer, actualizar, eliminar) y la simulación del pago.

const CLAVE = 'pedidos_perfumes';

// Probabilidad de que el pago simulado salga bien: 1 = siempre exitoso, 0 = siempre fallido.
export const PROBABILIDAD_EXITO = 0.7;
const DEMORA_PAGO_MS = 1500;

const leer = () => {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
};

const guardar = (pedidos) => localStorage.setItem(CLAVE, JSON.stringify(pedidos));

export const calcularTotal = (items) =>
  items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

// Número de pedido: AAAAMMDD + correlativo del día (ej. 2026101001)
const generarNumero = (existentes) => {
  const hoy = new Date();
  const prefijo = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
  const correlativos = existentes
    .filter((p) => p.id.startsWith(prefijo))
    .map((p) => Number(p.id.slice(prefijo.length)));
  const siguiente = (correlativos.length ? Math.max(...correlativos) : 0) + 1;
  return `${prefijo}${String(siguiente).padStart(2, '0')}`;
};

// ---------- CRUD ----------

export const obtenerPedidos = () => leer();

export const obtenerPedido = (id) => leer().find((p) => p.id === id) || null;

export const crearPedido = ({ cliente, envio, items }) => {
  const pedidos = leer();
  const pedido = {
    id: generarNumero(pedidos),
    codigo: `ORDER${Math.floor(10000 + Math.random() * 90000)}`,
    fecha: new Date().toISOString(),
    estado: 'pendiente', // pendiente | pagado | fallido
    intentos: 0,
    cliente,
    envio,
    // Se guarda una copia de los productos para que el pedido no cambie si el catálogo cambia
    items: items.map(({ id, marca, modelo, nombre, imagenes, precio, cantidad }) => ({
      id,
      marca,
      modelo: modelo || nombre,
      imagenes,
      precio,
      cantidad,
    })),
    total: calcularTotal(items),
  };
  guardar([...pedidos, pedido]);
  return pedido;
};

export const actualizarPedido = (id, cambios) => {
  let actualizado = null;
  const pedidos = leer().map((p) => {
    if (p.id !== id) return p;
    actualizado = { ...p, ...cambios };
    return actualizado;
  });
  guardar(pedidos);
  return actualizado;
};

export const eliminarPedido = (id) => {
  guardar(leer().filter((p) => p.id !== id));
};

// ---------- Pago simulado ----------

// Simula el cobro: espera un momento y marca el pedido como pagado o fallido.
// Devuelve una promesa con el pedido ya actualizado.
export const procesarPago = (id) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const pedido = obtenerPedido(id);
      const exito = Math.random() < PROBABILIDAD_EXITO;
      resolve(
        actualizarPedido(id, {
          estado: exito ? 'pagado' : 'fallido',
          intentos: (pedido?.intentos || 0) + 1,
        })
      );
    }, DEMORA_PAGO_MS);
  });
