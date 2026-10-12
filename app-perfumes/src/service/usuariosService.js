// Fuente de datos simulada de usuarios + CRUD (localStorage).
// Comparte la clave 'usuarios_perfumes' con Registro y Login.
import { leerLista, guardarLista } from './storage';

const CLAVE = 'usuarios_perfumes';

// Administrador por defecto para poder entrar al panel (cumple las reglas del login).
export const ADMIN_POR_DEFECTO = {
  rut: '111111111',
  correo: 'admin@duoc.cl',
  nombre: 'Administrador',
  apellido: 'Perfumes Store',
  pass: 'admin123',
  rol: 'admin',
  fechaNac: '',
  region: '',
  comuna: '',
  direccion: '',
};

// Garantiza que exista al menos un admin. Se llama al iniciar la app.
export const asegurarAdmin = () => {
  const lista = leerLista(CLAVE);
  if (!lista.some((u) => u.rol === 'admin')) {
    guardarLista(CLAVE, [...lista, ADMIN_POR_DEFECTO]);
  }
};

export const obtenerUsuarios = () => leerLista(CLAVE);

export const obtenerUsuario = (correo) =>
  obtenerUsuarios().find((u) => u.correo === correo) || null;

// Devuelve { error } si el correo o RUN ya existen; si no, el usuario creado.
export const crearUsuario = (datos) => {
  const lista = obtenerUsuarios();
  if (lista.some((u) => u.correo === datos.correo || (datos.rut && u.rut === datos.rut))) {
    return { error: 'Ya existe un usuario con ese correo o RUN.' };
  }
  const nuevo = { rol: 'cliente', ...datos };
  guardarLista(CLAVE, [...lista, nuevo]);
  return nuevo;
};

// correoOriginal identifica al usuario (el correo es único)
export const actualizarUsuario = (correoOriginal, cambios) => {
  const lista = obtenerUsuarios();
  if (
    cambios.correo &&
    cambios.correo !== correoOriginal &&
    lista.some((u) => u.correo === cambios.correo)
  ) {
    return { error: 'Ese correo ya está en uso.' };
  }
  let actualizado = null;
  guardarLista(
    CLAVE,
    lista.map((u) => {
      if (u.correo !== correoOriginal) return u;
      actualizado = { ...u, ...cambios };
      return actualizado;
    })
  );
  return actualizado;
};

export const eliminarUsuario = (correo) =>
  guardarLista(CLAVE, obtenerUsuarios().filter((u) => u.correo !== correo));
