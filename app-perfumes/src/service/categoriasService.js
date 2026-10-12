import { leerLista, guardarLista } from './storage';

const CLAVE = 'categorias_perfumes';

export const obtenerCategorias = () => {
  const guardadas = leerLista(CLAVE);
  if (guardadas.length) return guardadas;
  const base = [
    { id: 1, nombre: 'arabe', descripcion: 'Fragancias árabes, intensas y duraderas' },
    { id: 2, nombre: 'nicho', descripcion: 'Perfumería de nicho y ediciones limitadas' },
    { id: 3, nombre: 'diseñador', descripcion: 'Casas de moda y perfumería de diseñador' },
  ];
  guardarLista(CLAVE, base);
  return base;
};

export const crearCategoria = ({ nombre, descripcion }) => {
  const lista = obtenerCategorias();
  const id = (lista.length ? Math.max(...lista.map((c) => c.id)) : 0) + 1;
  const nueva = { id, nombre: nombre.trim(), descripcion: (descripcion || '').trim() };
  guardarLista(CLAVE, [...lista, nueva]);
  return nueva;
};

export const actualizarCategoria = (id, cambios) =>
  guardarLista(
    CLAVE,
    obtenerCategorias().map((c) => (c.id === id ? { ...c, ...cambios } : c))
  );

export const eliminarCategoria = (id) =>
  guardarLista(CLAVE, obtenerCategorias().filter((c) => c.id !== id));
