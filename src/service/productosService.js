const CLAVE = 'productos_perfumes';

// Copia temporal en memoria, no en localStorage
let cacheProductos = [];

const leerLista = () => cacheProductos;

const guardarLista = (_clave, lista) => {
  cacheProductos = lista;
};


export const STOCK_CRITICO = 5;
const STOCK_INICIAL = 20;

// Obtener productos de la copia temporal del frontend
export const obtenerProductos = () => leerLista(CLAVE);

// Función auxiliar para comunicarse con Spring Boot
const solicitarAPI = async (ruta, opciones = {}) => {
  const respuesta = await fetch(ruta, opciones);

  if (!respuesta.ok) {
    let mensaje = `Error HTTP ${respuesta.status}`;

    try {
      const datos = await respuesta.json();
      mensaje = datos.error || datos.message || mensaje;
    } catch {
      // Conservar el mensaje HTTP si no hay respuesta JSON
    }

    throw new Error(mensaje);
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
};

// Cargar productos desde Spring Boot y MySQL
export const cargarProductos = async () => {
  const productos = await solicitarAPI('/api/productos');

  if (!Array.isArray(productos)) {
    throw new Error('El backend no devolvió una lista de productos');
  }

  guardarLista(CLAVE, productos);

  return productos;
};

// Buscar un producto por ID
export const obtenerProducto = (id) =>
  obtenerProductos().find(
    (p) => Number(p.id) === Number(id)
  ) || null;

// Crear un producto directamente en MySQL
export const crearProducto = async (datos) => {
  const nuevo = {
    ...datos,
    precio: Number(datos.precio),
    descuento: Number(datos.descuento ?? 0),
    stock: Number(datos.stock ?? STOCK_INICIAL),
  };

  // El ID lo genera MySQL
  delete nuevo.id;

  const creado = await solicitarAPI('/api/productos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(nuevo),
  });

  // Actualizar la copia local solo si MySQL guardó el producto
  guardarLista(CLAVE, [...obtenerProductos(), creado]);

  return creado;
};

// Actualizar un producto directamente en MySQL
export const actualizarProducto = async (id, cambios) => {
  const actual = obtenerProducto(id);

  if (!actual) {
    throw new Error('El producto no existe');
  }

  const actualizado = {
    ...actual,
    ...cambios,
    precio: Number(cambios.precio ?? actual.precio),
    descuento: Number(cambios.descuento ?? actual.descuento ?? 0),
    stock: Number(cambios.stock ?? actual.stock),
  };

  const guardado = await solicitarAPI(`/api/productos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(actualizado),
  });

  guardarLista(
    CLAVE,
    obtenerProductos().map((p) =>
      Number(p.id) === Number(id) ? guardado : p
    )
  );

  return guardado;
};

// Eliminar un producto directamente de MySQL
export const eliminarProducto = async (id) => {
  await solicitarAPI(`/api/productos/${id}`, {
    method: 'DELETE',
  });

  guardarLista(
    CLAVE,
    obtenerProductos().filter(
      (p) => Number(p.id) !== Number(id)
    )
  );
};

// Comprobar si el stock es crítico
export const esCritico = (p) =>
  Number(p.stock) <= STOCK_CRITICO;

// Descontar stock temporalmente en el frontend
// Lo reemplazaremos al conectar el proceso de compra
export const descontarStock = (items) => {
  const vendidos = Object.fromEntries(
    items.map((i) => [Number(i.id), i.cantidad])
  );

  guardarLista(
    CLAVE,
    obtenerProductos().map((p) =>
      vendidos[Number(p.id)]
        ? {
            ...p,
            stock: Math.max(
              0,
              Number(p.stock) - vendidos[Number(p.id)]
            ),
          }
        : p
    )
  );
};
