
const API = '/api/categorias';
let categoriasCache = [];

const comprobarRespuesta = async (respuesta) => {
  if (respuesta.ok) return;

  const cuerpo = await respuesta.json().catch(() => null);

  throw new Error(
    cuerpo?.error || `Error HTTP ${respuesta.status}`
  );
};

// Obtener las categorías cargadas
export const obtenerCategorias = () => [...categoriasCache];

// Consultar las categorías desde MySQL
export const cargarCategorias = async () => {
  const respuesta = await fetch(API);
  await comprobarRespuesta(respuesta);

  const categorias = await respuesta.json();

  if (!Array.isArray(categorias)) {
    throw new Error(
      'El servidor no devolvió una lista de categorías.'
    );
  }

  categoriasCache = categorias;
  return obtenerCategorias();
};

// Crear una categoría en MySQL
export const crearCategoria = async ({ nombre, descripcion }) => {
  const respuesta = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre: nombre.trim(),
      descripcion: (descripcion || '').trim()
    })
  });

  await comprobarRespuesta(respuesta);

  const nueva = await respuesta.json();
  categoriasCache = [...categoriasCache, nueva];

  return nueva;
};

// Actualizar una categoría en MySQL
export const actualizarCategoria = async (id, cambios) => {
  const respuesta = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre: cambios.nombre.trim(),
      descripcion: (cambios.descripcion || '').trim()
    })
  });

  await comprobarRespuesta(respuesta);

  const actualizada = await respuesta.json();

  categoriasCache = categoriasCache.map((categoria) =>
    Number(categoria.id) === Number(id)
      ? actualizada
      : categoria
  );

  return actualizada;
};

// Eliminar una categoría de MySQL
export const eliminarCategoria = async (id) => {
  const respuesta = await fetch(`${API}/${id}`, {
    method: 'DELETE'
  });

  await comprobarRespuesta(respuesta);

  categoriasCache = categoriasCache.filter(
    (categoria) => Number(categoria.id) !== Number(id)
  );
};
