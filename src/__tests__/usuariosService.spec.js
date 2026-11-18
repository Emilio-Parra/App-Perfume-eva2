import {
  ADMIN_POR_DEFECTO,
  asegurarAdmin,
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../service/usuariosService';

describe('service/usuariosService', () => {
  beforeEach(() => localStorage.removeItem('usuarios_perfumes'));

  it('asegurarAdmin crea el administrador por defecto si no existe', () => {
    asegurarAdmin();
    const usuarios = obtenerUsuarios();
    expect(usuarios.length).toBe(1);
    expect(usuarios[0].correo).toBe(ADMIN_POR_DEFECTO.correo);
    expect(usuarios[0].rol).toBe('admin');
  });

  it('asegurarAdmin no duplica al administrador si ya existe', () => {
    asegurarAdmin();
    asegurarAdmin();
    expect(obtenerUsuarios().length).toBe(1);
  });

  it('crearUsuario asigna el rol cliente y rechaza correos repetidos', () => {
    const nuevo = crearUsuario({ correo: 'ana@duoc.cl', rut: '123456785', nombre: 'Ana' });
    expect(nuevo.rol).toBe('cliente');
    const repetido = crearUsuario({ correo: 'ana@duoc.cl', rut: '999999999' });
    expect(repetido.error).toBeDefined();
    expect(obtenerUsuarios().length).toBe(1);
  });

  it('actualizarUsuario cambia los datos y eliminarUsuario lo borra', () => {
    crearUsuario({ correo: 'ana@duoc.cl', rut: '123456785', nombre: 'Ana' });
    const actualizado = actualizarUsuario('ana@duoc.cl', { nombre: 'Ana María' });
    expect(actualizado.nombre).toBe('Ana María');
    eliminarUsuario('ana@duoc.cl');
    expect(obtenerUsuarios().length).toBe(0);
  });
});
