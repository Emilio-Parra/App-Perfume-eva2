// Usuarios del administrador: datos en MySQL por Spring Boot, no localStorage.
const API = '/api/admin/usuarios';
let usuariosCache = [];

const validar = async (respuesta) => {
  if (respuesta.ok) return;
  const datos = await respuesta.json().catch(() => null);
  throw new Error(datos?.error || `Error HTTP ${respuesta.status}`);
};

// Se conserva por compatibilidad con App.jsx. El admin real ya existe en MySQL.
export const asegurarAdmin = () => {};

export const obtenerUsuarios = () => [...usuariosCache];
export const obtenerUsuario = (correo) =>
  usuariosCache.find((u) => u.correo === correo) || null;

export const cargarUsuarios = async () => {
  const respuesta = await fetch(API);
  await validar(respuesta);
  const usuarios = await respuesta.json();
  if (!Array.isArray(usuarios)) throw new Error('El servidor no devolvió una lista de usuarios.');
  usuariosCache = usuarios;
  return obtenerUsuarios();
};

export const crearUsuario = async (datos) => {
  const respuesta = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...datos, rol: 'cliente' }),
  });
  await validar(respuesta);
  const creado = await respuesta.json();
  usuariosCache = [...usuariosCache, creado];
  return creado;
};

export const actualizarUsuario = async (correoOriginal, cambios) => {
  const respuesta = await fetch(`${API}/${encodeURIComponent(correoOriginal)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...obtenerUsuario(correoOriginal), ...cambios, rol: 'cliente' }),
  });
  await validar(respuesta);
  const actualizado = await respuesta.json();
  usuariosCache = usuariosCache.map((u) => u.correo === correoOriginal ? actualizado : u);
  return actualizado;
};

export const eliminarUsuario = async (correo) => {
  const respuesta = await fetch(`${API}/${encodeURIComponent(correo)}`, {
    method: 'DELETE',
  });
  await validar(respuesta);
  usuariosCache = usuariosCache.filter((u) => u.correo !== correo);
  return true;
};
