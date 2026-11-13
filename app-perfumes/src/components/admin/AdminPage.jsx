import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrdenes, AdminBoleta } from './AdminOrdenes';
import { AdminProductos, AdminProductosCriticos, AdminProductoFormulario } from './AdminProductos';
import { AdminCategorias } from './AdminCategorias';
import { AdminUsuarios, AdminUsuarioFormulario, AdminHistorial } from './AdminUsuarios';
import { AdminReportes } from './AdminReportes';
import { AdminPerfil } from './AdminPerfil';
import { obtenerPedidos, obtenerPedido } from '../../service/pedidosService';
import { obtenerProductos, obtenerProducto, crearProducto, actualizarProducto, eliminarProducto } from '../../service/productosService';
import { obtenerCategorias, cargarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../../service/categoriasService';
import { obtenerUsuarios, obtenerUsuario, cargarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../../service/usuariosService';

// Contenedor del panel de administración. Las categorías y pedidos se consultan
// desde Spring Boot; los demás servicios conservan sus funciones actuales.
export function AdminPage({ usuarioActual, onUsuarioActualizado, onProductosCambiados, onIrATienda, onCerrarSesion }) {
  const [ruta, setRuta] = useState({ vista: 'dashboard', param: null, volver: null });
  const [datos, setDatos] = useState(() => ({
    productos: obtenerProductos(),
    categorias: obtenerCategorias(),
    usuarios: obtenerUsuarios(),
    pedidos: obtenerPedidos(),
  }));
  const [errorUsuario, setErrorUsuario] = useState('');
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [errorListadoUsuarios, setErrorListadoUsuarios] = useState('');
  const [errorCategorias, setErrorCategorias] = useState('');

  // Al abrir el administrador, cargar las categorías desde MySQL.
  useEffect(() => {
    let activo = true;
    cargarCategorias()
      .then((categorias) => {
        if (activo) setDatos((anterior) => ({ ...anterior, categorias }));
      })
      .catch((error) => {
        if (activo) setErrorCategorias('No se pudieron cargar las categorías: ' + error.message);
      });
    return () => { activo = false; };
  }, []);

  // Listado real de clientes desde MySQL.
  useEffect(() => {
    let activo = true;
    cargarUsuarios()
      .then((usuarios) => {
        if (activo) setDatos((anterior) => ({ ...anterior, usuarios }));
      })
      .catch((error) => {
        if (activo) setErrorListadoUsuarios('No se pudieron cargar los usuarios: ' + error.message);
      })
      .finally(() => { if (activo) setCargandoUsuarios(false); });
    return () => { activo = false; };
  }, []);

  // Órdenes reales de MySQL. El resto del panel sigue como estaba.
  const [pedidosMySQL, setPedidosMySQL] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [errorPedidos, setErrorPedidos] = useState('');

  // Cargar ventas reales para Dashboard, Órdenes y Reportes.
  // También se actualizan al volver a entrar a esas secciones.
  useEffect(() => {
    const vistasConPedidos = ['dashboard', 'ordenes', 'reportes', 'producto-reportes', 'usuario-historial'];
    if (!vistasConPedidos.includes(ruta.vista)) return;

    let cancelado = false;

    const cargarPedidosAdmin = async () => {
      setCargandoPedidos(true);
      setErrorPedidos('');

      try {
        const respuesta = await fetch('/api/pedidos/admin');
        if (!respuesta.ok) {
          throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const pedidos = await respuesta.json();
        if (!Array.isArray(pedidos)) {
          throw new Error('El backend no devolvió una lista de pedidos.');
        }

        // Si el pedido también está en este navegador, recuperamos sus
        // datos de envío. El estado, total y productos vienen de MySQL.
        const completados = pedidos.map((pedido) => {
          const local = obtenerPedido(pedido.id);
          if (!local || local.codigo !== pedido.codigo) return pedido;
          return {
            ...pedido,
            cliente: local.cliente,
            envio: local.envio,
          };
        });

        if (!cancelado) setPedidosMySQL(completados);
      } catch (error) {
        if (!cancelado) {
          setErrorPedidos('No se pudieron cargar las órdenes de MySQL: ' + error.message);
        }
      } finally {
        if (!cancelado) setCargandoPedidos(false);
      }
    };

    cargarPedidosAdmin();
    return () => { cancelado = true; };
  }, [ruta.vista]);

  const refrescar = () => {
    setDatos({
      productos: obtenerProductos(),
      categorias: obtenerCategorias(),
      usuarios: obtenerUsuarios(),
      pedidos: obtenerPedidos(),
    });
    onProductosCambiados();
  };

  const ir = (vista, param = null, volver = null) => {
    setErrorUsuario('');
    setRuta({ vista, param, volver });
  };

  // ----- Productos -----
  
  const guardarProducto = async (d) => {
    try {
      if (ruta.param) {
        await actualizarProducto(ruta.param, d);
      } else {
        await crearProducto(d);
      }

      refrescar();
      ir('productos');
    } catch (error) {
      window.alert('Error al guardar el producto: ' + error.message);
    }
  };


  
  const borrarProducto = async (p) => {
    if (window.confirm(`¿Eliminar "${p.marca} ${p.modelo}"?`)) {
      try {
        await eliminarProducto(p.id);
        refrescar();
      } catch (error) {
        window.alert('Error al eliminar el producto: ' + error.message);
      }
    }
  };


  // ----- Categorías guardadas en MySQL -----
  const guardarCategoria = async (categoria) => {
    try {
      await crearCategoria(categoria);
      setErrorCategorias('');
      refrescar();
    } catch (error) {
      window.alert('Error al crear la categoría: ' + error.message);
    }
  };

  // Si se renombra una categoría, actualizar también los productos asociados.
  const editarCategoria = async (cat, cambios) => {
    try {
      await actualizarCategoria(cat.id, cambios);
      if (cambios.nombre !== cat.nombre) {
        for (const producto of obtenerProductos().filter((p) => p.tipo === cat.nombre)) {
          // La API PUT necesita el producto completo para no borrar otros campos.
          await actualizarProducto(producto.id, { ...producto, tipo: cambios.nombre });
        }
      }
      setErrorCategorias('');
      refrescar();
    } catch (error) {
      refrescar();
      window.alert('Error al editar la categoría o sus productos: ' + error.message);
    }
  };

  const borrarCategoria = async (cat, usados) => {
    if (usados > 0) {
      window.alert(`No se puede eliminar: hay ${usados} producto(s) en la categoría "${cat.nombre}".`);
      return;
    }
    if (window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) {
      try {
        await eliminarCategoria(cat.id);
        refrescar();
      } catch (error) {
        window.alert('Error al eliminar la categoría: ' + error.message);
      }
    }
  };

  // ----- Usuarios guardados en MySQL -----
  const guardarUsuario = async (d) => {
    try {
      setErrorUsuario('');
      if (ruta.param) {
        await actualizarUsuario(ruta.param, d);
      } else {
        await crearUsuario(d);
      }
      refrescar();
      ir('usuarios');
    } catch (error) {
      setErrorUsuario(error.message);
    }
  };

  const borrarUsuario = async (u) => {
    if (!window.confirm(`¿Eliminar a ${u.nombre} ${u.apellido}?`)) return;
    try {
      await eliminarUsuario(u.correo);
      refrescar();
    } catch (error) {
      window.alert('No se pudo eliminar el cliente: ' + error.message);
    }
  };

  // Guardar y comprobar el perfil en Spring Boot antes de actualizar la pantalla.
  const guardarPerfil = async (cambios) => {
    const solicitado = {
      nombre: cambios.nombre.trim(),
      apellido: cambios.apellido.trim(),
      ...(cambios.pass ? { pass: cambios.pass } : {}),
    };

    const respuesta = await fetch('/api/admin/perfil', {
      method: 'PUT',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solicitado),
    });

    const guardado = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      throw new Error(guardado?.error || `Error HTTP ${respuesta.status}`);
    }

    if (guardado?.nombre !== solicitado.nombre || guardado?.apellido !== solicitado.apellido) {
      throw new Error('El servidor no devolvió los datos que intentaste guardar.');
    }

    // Volver a consultar el backend, evitando respuestas antiguas del navegador.
    const comprobar = await fetch(`/api/admin/perfil?verificacion=${Date.now()}`, {
      credentials: 'same-origin',
      cache: 'no-store',
    });
    const confirmado = await comprobar.json().catch(() => null);
    if (!comprobar.ok) {
      throw new Error(confirmado?.error || `Error al verificar: HTTP ${comprobar.status}`);
    }
    if (confirmado?.nombre !== solicitado.nombre || confirmado?.apellido !== solicitado.apellido) {
      throw new Error(
        'Spring Boot respondió 200, pero al consultar otra vez devolvió ' +
        `"${confirmado?.nombre ?? 'sin nombre'}" en lugar de "${solicitado.nombre}". ` +
        'No se puede confirmar el guardado en MySQL.'
      );
    }

    // Sólo ahora actualizar el nombre visible y mostrar éxito en AdminPerfil.
    onUsuarioActualizado({ ...usuarioActual, ...confirmado });
    return confirmado;
  };

  const { vista, param, volver } = ruta;

  // Evita mostrar cifras incorrectas mientras se consulta MySQL.
  const mostrarConPedidos = (vistaConDatos) => {
    if (cargandoPedidos) {
      return <p className="text-muted">Cargando datos desde MySQL...</p>;
    }
    if (errorPedidos) {
      return <div className="alert alert-danger" role="alert">{errorPedidos}</div>;
    }
    return vistaConDatos;
  };

  let contenido;
  switch (vista) {
    case 'ordenes':
      contenido = mostrarConPedidos(
        <AdminOrdenes
          pedidos={pedidosMySQL}
          onVerBoleta={(id) => ir('boleta', id, 'ordenes')}
        />
      );
      break;
    case 'boleta':
      contenido = (
        <AdminBoleta
          pedido={pedidosMySQL.find((p) => String(p.id) === String(param)) || obtenerPedido(param)}
          onVolver={() => (volver && volver.vista ? ir(volver.vista, volver.param) : ir(volver || 'ordenes'))}
        />
      );
      break;
    case 'productos':
      contenido = (
        <AdminProductos productos={datos.productos} categorias={datos.categorias} vista={vista} onIr={ir}
          onEditar={(id) => ir('producto-editar', id)} onEliminar={borrarProducto} />
      );
      break;
    case 'producto-criticos':
      contenido = (
        <AdminProductosCriticos productos={datos.productos} vista={vista} onIr={ir}
          onEditar={(id) => ir('producto-editar', id)} onEliminar={borrarProducto} />
      );
      break;
    case 'producto-reportes':
      contenido = mostrarConPedidos(
        <AdminReportes productos={datos.productos} pedidos={pedidosMySQL} alcance="productos" />
      );
      break;
    case 'producto-nuevo':
    case 'producto-editar':
      contenido = (
        <AdminProductoFormulario
          key={param || 'nuevo'}
          producto={param ? obtenerProducto(param) : null}
          categorias={datos.categorias}
          onGuardar={guardarProducto}
          onCancelar={() => ir('productos')}
        />
      );
      break;
    case 'categorias':
      contenido = (
        <>
          {errorCategorias && <div className="alert alert-danger" role="alert">{errorCategorias}</div>}
          <AdminCategorias categorias={datos.categorias} productos={datos.productos}
            onCrear={guardarCategoria}
            onActualizar={editarCategoria} onEliminar={borrarCategoria} />
        </>
      );
      break;
    case 'usuarios':
      contenido = (
        <>
          {cargandoUsuarios && <p className="text-muted">Cargando clientes desde MySQL...</p>}
          {errorListadoUsuarios && <div className="alert alert-danger">{errorListadoUsuarios}</div>}
          {!cargandoUsuarios && !errorListadoUsuarios &&
            <AdminUsuarios usuarios={datos.usuarios} usuarioActual={usuarioActual}
              onNuevo={() => ir('usuario-nuevo')}
              onEditar={(correo) => ir('usuario-editar', correo)}
              onHistorial={(correo) => ir('usuario-historial', correo)}
              onEliminar={borrarUsuario} />}
        </>
      );
      break;
    case 'usuario-nuevo':
    case 'usuario-editar':
      contenido = (
        <AdminUsuarioFormulario
          key={param || 'nuevo'}
          usuario={param ? obtenerUsuario(param) : null}
          error={errorUsuario}
          onGuardar={guardarUsuario}
          onCancelar={() => ir('usuarios')}
        />
      );
      break;
    case 'usuario-historial':
      contenido = mostrarConPedidos(
        <AdminHistorial usuario={obtenerUsuario(param)} pedidos={pedidosMySQL}
          onVerBoleta={(id) => ir('boleta', id, { vista: 'usuario-historial', param })}
          onVolver={() => ir('usuarios')} />
      );
      break;
    case 'reportes':
      contenido = mostrarConPedidos(
        <AdminReportes productos={datos.productos} pedidos={pedidosMySQL} />
      );
      break;
    case 'perfil':
      contenido = <AdminPerfil usuario={usuarioActual} onGuardar={guardarPerfil} />;
      break;
    default:
      contenido = mostrarConPedidos(
        <AdminDashboard productos={datos.productos} pedidos={pedidosMySQL} usuarios={datos.usuarios}
          onIr={ir} onIrATienda={onIrATienda} />
      );
  }

  return (
    <AdminLayout vista={vista} onIr={ir} onIrATienda={onIrATienda} onCerrarSesion={onCerrarSesion} usuario={usuarioActual}>
      {contenido}
    </AdminLayout>
  );
}
