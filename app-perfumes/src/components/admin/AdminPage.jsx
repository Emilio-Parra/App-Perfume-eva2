import React, { useState } from 'react';
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
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../../service/categoriasService';
import { obtenerUsuarios, obtenerUsuario, crearUsuario, actualizarUsuario, eliminarUsuario } from '../../service/usuariosService';

// Contenedor del panel de administración. Lee/escribe en los servicios (localStorage)
// y refresca su estado después de cada cambio; avisa a App para que la tienda se actualice.
export function AdminPage({ usuarioActual, onUsuarioActualizado, onProductosCambiados, onIrATienda, onCerrarSesion }) {
  const [ruta, setRuta] = useState({ vista: 'dashboard', param: null, volver: null });
  const [datos, setDatos] = useState(() => ({
    productos: obtenerProductos(),
    categorias: obtenerCategorias(),
    usuarios: obtenerUsuarios(),
    pedidos: obtenerPedidos(),
  }));
  const [errorUsuario, setErrorUsuario] = useState('');

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
  const guardarProducto = (d) => {
    if (ruta.param) actualizarProducto(ruta.param, d);
    else crearProducto(d);
    refrescar();
    ir('productos');
  };
  const borrarProducto = (p) => {
    if (window.confirm(`¿Eliminar "${p.marca} ${p.modelo}"?`)) {
      eliminarProducto(p.id);
      refrescar();
    }
  };

  // ----- Categorías (renombrar actualiza también los productos que la usan) -----
  const editarCategoria = (cat, cambios) => {
    actualizarCategoria(cat.id, cambios);
    if (cambios.nombre !== cat.nombre) {
      obtenerProductos()
        .filter((p) => p.tipo === cat.nombre)
        .forEach((p) => actualizarProducto(p.id, { tipo: cambios.nombre }));
    }
    refrescar();
  };
  const borrarCategoria = (cat, usados) => {
    if (usados > 0) {
      window.alert(`No se puede eliminar: hay ${usados} producto(s) en la categoría "${cat.nombre}".`);
      return;
    }
    if (window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) {
      eliminarCategoria(cat.id);
      refrescar();
    }
  };

  // ----- Usuarios -----
  const guardarUsuario = (d) => {
    const resultado = ruta.param ? actualizarUsuario(ruta.param, d) : crearUsuario(d);
    if (resultado?.error) return setErrorUsuario(resultado.error);
    // Si el admin se editó a sí mismo, se actualiza la sesión
    if (ruta.param && ruta.param === usuarioActual.correo) onUsuarioActualizado(resultado);
    refrescar();
    ir('usuarios');
  };
  const borrarUsuario = (u) => {
    if (window.confirm(`¿Eliminar a ${u.nombre} ${u.apellido}?`)) {
      eliminarUsuario(u.correo);
      refrescar();
    }
  };

  const guardarPerfil = (cambios) => {
    const actualizado = actualizarUsuario(usuarioActual.correo, cambios);
    onUsuarioActualizado(actualizado);
    refrescar();
  };

  const { vista, param, volver } = ruta;
  let contenido;
  switch (vista) {
    case 'ordenes':
      contenido = <AdminOrdenes pedidos={datos.pedidos} onVerBoleta={(id) => ir('boleta', id, 'ordenes')} />;
      break;
    case 'boleta':
      contenido = (
        <AdminBoleta
          pedido={obtenerPedido(param)}
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
      contenido = <AdminReportes productos={datos.productos} pedidos={datos.pedidos} alcance="productos" />;
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
        <AdminCategorias categorias={datos.categorias} productos={datos.productos}
          onCrear={(c) => { crearCategoria(c); refrescar(); }}
          onActualizar={editarCategoria} onEliminar={borrarCategoria} />
      );
      break;
    case 'usuarios':
      contenido = (
        <AdminUsuarios usuarios={datos.usuarios} usuarioActual={usuarioActual}
          onNuevo={() => ir('usuario-nuevo')}
          onEditar={(correo) => ir('usuario-editar', correo)}
          onHistorial={(correo) => ir('usuario-historial', correo)}
          onEliminar={borrarUsuario} />
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
      contenido = (
        <AdminHistorial usuario={obtenerUsuario(param)} pedidos={datos.pedidos}
          onVerBoleta={(id) => ir('boleta', id, { vista: 'usuario-historial', param })}
          onVolver={() => ir('usuarios')} />
      );
      break;
    case 'reportes':
      contenido = <AdminReportes productos={datos.productos} pedidos={datos.pedidos} />;
      break;
    case 'perfil':
      contenido = <AdminPerfil usuario={usuarioActual} onGuardar={guardarPerfil} />;
      break;
    default:
      contenido = (
        <AdminDashboard productos={datos.productos} pedidos={datos.pedidos} usuarios={datos.usuarios}
          onIr={ir} onIrATienda={onIrATienda} />
      );
  }

  return (
    <AdminLayout vista={vista} onIr={ir} onIrATienda={onIrATienda} onCerrarSesion={onCerrarSesion} usuario={usuarioActual}>
      {contenido}
    </AdminLayout>
  );
}
