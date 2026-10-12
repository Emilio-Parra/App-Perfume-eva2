import React, { useState } from 'react';
import { UsuarioForm } from './UsuarioForm';
import { EstadoBadge } from './AdminOrdenes';
import { clp } from '../../utils/formato';

export function AdminUsuarios({ usuarios, usuarioActual, onNuevo, onEditar, onHistorial, onEliminar }) {
  const [texto, setTexto] = useState('');
  const q = texto.trim().toLowerCase();
  const filtrados = usuarios.filter(
    (u) => !q || `${u.nombre} ${u.apellido} ${u.correo} ${u.rut}`.toLowerCase().includes(q)
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h1 className="h3 mb-0">Usuarios</h1>
        <button className="btn btn-primary btn-sm" onClick={onNuevo}>+ Nuevo usuario</button>
      </div>
      <input className="form-control mb-3" placeholder="Buscar por nombre, correo o RUN" aria-label="Buscar usuarios" value={texto} onChange={(e) => setTexto(e.target.value)} />
      <div className="table-responsive bg-white rounded shadow-sm">
        <table className="table table-hover align-middle mb-0">
          <thead><tr><th>RUN</th><th>Nombre</th><th>Correo</th><th>Rol</th><th></th></tr></thead>
          <tbody>
            {filtrados.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-4">No hay usuarios que mostrar.</td></tr>}
            {filtrados.map((u) => (
              <tr key={u.correo}>
                <td>{u.rut}</td>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.correo}</td>
                <td><span className={`badge text-bg-${u.rol === 'admin' ? 'warning' : 'secondary'}`}>{u.rol || 'cliente'}</span></td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => onHistorial(u.correo)}>Historial</button>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => onEditar(u.correo)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" disabled={u.correo === usuarioActual?.correo} onClick={() => onEliminar(u)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminUsuarioFormulario({ usuario, error, onGuardar, onCancelar }) {
  return (
    <>
      <h1 className="h3 mb-3">{usuario ? 'Editar usuario' : 'Nuevo usuario'}</h1>
      <UsuarioForm inicial={usuario} errorExterno={error} onGuardar={onGuardar} onCancelar={onCancelar} />
    </>
  );
}

export function AdminHistorial({ usuario, pedidos, onVerBoleta, onVolver }) {
  if (!usuario) return <p className="text-muted">El usuario no existe.</p>;
  const propios = pedidos.filter((p) => p.cliente.correo === usuario.correo);
  const pagados = propios.filter((p) => p.estado === 'pagado');
  return (
    <>
      <h1 className="h3">Historial de compras</h1>
      <p className="text-muted">{usuario.nombre} {usuario.apellido} · {usuario.correo} · {pagados.length} compras pagadas por {clp(pagados.reduce((a, p) => a + p.total, 0))}</p>
      <div className="table-responsive bg-white rounded shadow-sm mb-3">
        <table className="table align-middle mb-0">
          <thead><tr><th>Nro</th><th>Fecha</th><th className="text-end">Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {propios.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-4">Este usuario aún no tiene compras.</td></tr>}
            {propios.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{new Date(p.fecha).toLocaleString('es-CL')}</td>
                <td className="text-end">{clp(p.total)}</td>
                <td><EstadoBadge estado={p.estado} /></td>
                <td className="text-end"><button className="btn btn-sm btn-outline-primary" onClick={() => onVerBoleta(p.id)}>Ver boleta</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn btn-outline-dark" onClick={onVolver}>Volver a usuarios</button>
    </>
  );
}
