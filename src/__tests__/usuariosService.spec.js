
import {
  asegurarAdmin,
  obtenerUsuarios,
  obtenerUsuario,
  cargarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../service/usuariosService';

// Simula respuestas del backend sin modificar MySQL.
const respuestaOK = (datos) => ({
  ok: true,
  status: 200,
  json: async () => datos,
});

describe('service/usuariosService - Spring Boot y MySQL', () => {
  let fetchOriginal;

  beforeEach(async () => {
    fetchOriginal = window.fetch;

    window.fetch = jasmine
      .createSpy('fetch')
      .and.resolveTo(respuestaOK([]));

    // Limpiar la caché de usuarios antes de cada prueba.
    await cargarUsuarios();
    window.fetch.calls.reset();
  });

  afterEach(() => {
    window.fetch = fetchOriginal;
  });

  it('asegurarAdmin no crea administradores en localStorage', () => {
    asegurarAdmin();
    asegurarAdmin();

    expect(obtenerUsuarios().length).toBe(0);
    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('cargarUsuarios obtiene los usuarios desde Spring Boot', async () => {
    const usuarios = [
      {
        id: 1,
        correo: 'ana@duoc.cl',
        nombre: 'Ana',
        rol: 'cliente',
      },
      {
        id: 2,
        correo: 'pedro@duoc.cl',
        nombre: 'Pedro',
        rol: 'vendedor',
      },
    ];

    window.fetch.and.resolveTo(respuestaOK(usuarios));

    const resultado = await cargarUsuarios();

    expect(resultado.length).toBe(2);
    expect(resultado[0].correo).toBe('ana@duoc.cl');
    expect(resultado[1].rol).toBe('vendedor');

    expect(window.fetch).toHaveBeenCalledWith(
      '/api/admin/usuarios'
    );
  });

  it('crearUsuario envía un POST y actualiza la caché', async () => {
    const nuevoUsuario = {
      id: 3,
      correo: 'ana@duoc.cl',
      nombre: 'Ana',
      rol: 'cliente',
    };

    window.fetch.and.resolveTo(respuestaOK(nuevoUsuario));

    const resultado = await crearUsuario({
      correo: 'ana@duoc.cl',
      nombre: 'Ana',
    });

    expect(resultado.id).toBe(3);
    expect(resultado.rol).toBe('cliente');
    expect(obtenerUsuarios().length).toBe(1);

    const llamada = window.fetch.calls.mostRecent();

    expect(llamada.args[0]).toBe('/api/admin/usuarios');
    expect(llamada.args[1].method).toBe('POST');

    const cuerpo = JSON.parse(llamada.args[1].body);
    expect(cuerpo.rol).toBe('cliente');
  });

  it('actualizarUsuario envía un PUT y modifica la caché', async () => {
    const usuario = {
      id: 4,
      correo: 'ana@duoc.cl',
      nombre: 'Ana',
      rol: 'cliente',
    };

    window.fetch.and.resolveTo(respuestaOK([usuario]));
    await cargarUsuarios();

    const actualizado = {
      ...usuario,
      nombre: 'Ana María',
    };

    window.fetch.and.resolveTo(respuestaOK(actualizado));

    const resultado = await actualizarUsuario(
      'ana@duoc.cl',
      { nombre: 'Ana María' }
    );

    expect(resultado.nombre).toBe('Ana María');

    expect(
      obtenerUsuario('ana@duoc.cl').nombre
    ).toBe('Ana María');

    const llamada = window.fetch.calls.mostRecent();

    expect(llamada.args[0]).toBe(
      '/api/admin/usuarios/ana%40duoc.cl'
    );
    expect(llamada.args[1].method).toBe('PUT');
  });

  it('eliminarUsuario envía un DELETE y limpia la caché', async () => {
    const usuario = {
      id: 5,
      correo: 'ana@duoc.cl',
      nombre: 'Ana',
      rol: 'cliente',
    };

    window.fetch.and.resolveTo(respuestaOK([usuario]));
    await cargarUsuarios();

    window.fetch.and.resolveTo(respuestaOK(null));

    const eliminado = await eliminarUsuario('ana@duoc.cl');

    expect(eliminado).toBe(true);
    expect(obtenerUsuarios().length).toBe(0);
    expect(obtenerUsuario('ana@duoc.cl')).toBeNull();

    const llamada = window.fetch.calls.mostRecent();

    expect(llamada.args[0]).toBe(
      '/api/admin/usuarios/ana%40duoc.cl'
    );
    expect(llamada.args[1].method).toBe('DELETE');
  });

  it('propaga los errores enviados por Spring Boot', async () => {
    window.fetch.and.resolveTo({
      ok: false,
      status: 409,
      json: async () => ({
        error: 'El correo ya está registrado.',
      }),
    });

    await expectAsync(
      crearUsuario({ correo: 'ana@duoc.cl' })
    ).toBeRejectedWithError(
      'El correo ya está registrado.'
    );

    expect(obtenerUsuarios().length).toBe(0);
  });
});
