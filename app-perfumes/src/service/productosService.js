import { leerLista, guardarLista } from './storage';

const CLAVE = 'productos_perfumes';
export const STOCK_CRITICO = 5; // stock <= a este valor se considera crítico
const STOCK_INICIAL = 20;

export const obtenerProductos = () => leerLista(CLAVE);

// Carga el catálogo: usa lo guardado o, si no hay nada, siembra desde el JSON.
export const cargarProductos = async () => {
  const guardados = obtenerProductos();
  if (guardados.length) return guardados;
  const res = await fetch('/data/productos.json');
  const base = await res.json();
  const sembrados = base.map((p, i) => ({
    ...p,
    stock: p.stock ?? ((i * 7) % 18) + 2, // 2..19, algunos quedan críticos
    descripcion: p.descripcion || '',
  }));
  guardarLista(CLAVE, sembrados);
  return sembrados;
};

export const obtenerProducto = (id) =>
  obtenerProductos().find((p) => Number(p.id) === Number(id)) || null;

export const crearProducto = (datos) => {
  const lista = obtenerProductos();
  const id = (lista.length ? Math.max(...lista.map((p) => Number(p.id))) : 0) + 1;
  const nuevo = {
    ...datos,
    id,
    precio: Number(datos.precio),
    stock: Number(datos.stock ?? STOCK_INICIAL),
  };
  guardarLista(CLAVE, [...lista, nuevo]);
  return nuevo;
};

export const actualizarProducto = (id, cambios) => {
  let actualizado = null;
  const lista = obtenerProductos().map((p) => {
    if (Number(p.id) !== Number(id)) return p;
    actualizado = {
      ...p,
      ...cambios,
      precio: Number(cambios.precio ?? p.precio),
      stock: Number(cambios.stock ?? p.stock),
    };
    return actualizado;
  });
  guardarLista(CLAVE, lista);
  return actualizado;
};

export const eliminarProducto = (id) =>
  guardarLista(CLAVE, obtenerProductos().filter((p) => Number(p.id) !== Number(id)));

export const esCritico = (p) => Number(p.stock) <= STOCK_CRITICO;

// Descuenta del stock las unidades vendidas (items: [{ id, cantidad }]); nunca baja de 0.
export const descontarStock = (items) => {
  const vendidos = Object.fromEntries(items.map((i) => [Number(i.id), i.cantidad]));
  guardarLista(
    CLAVE,
    obtenerProductos().map((p) =>
      vendidos[Number(p.id)]
        ? { ...p, stock: Math.max(0, Number(p.stock) - vendidos[Number(p.id)]) }
        : p
    )
  );
};
