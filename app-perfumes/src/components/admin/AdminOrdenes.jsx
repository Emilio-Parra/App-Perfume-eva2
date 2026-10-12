import React, { useState } from 'react';
import { TablaResumen } from '../TablaResumen';
import { DatosEnvio } from '../DatosEnvio';
import { clp } from '../../utils/formato';

const BADGE = { pagado: 'success', fallido: 'danger', pendiente: 'secondary' };

export const EstadoBadge = ({ estado }) => (
  <span className={`badge text-bg-${BADGE[estado] || 'secondary'} text-capitalize`}>{estado}</span>
);

// Listado de órdenes / boletas con filtro por estado y búsqueda
export function AdminOrdenes({ pedidos, onVerBoleta }) {
  const [estado, setEstado] = useState('todos');
  const [texto, setTexto] = useState('');

  const q = texto.trim().toLowerCase();
  const filtrados = [...pedidos]
    .reverse()
    .filter((p) => estado === 'todos' || p.estado === estado)
    .filter(
      (p) =>
        !q ||
        p.id.includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        `${p.cliente.nombre} ${p.cliente.apellido} ${p.cliente.correo}`.toLowerCase().includes(q)
    );

  return (
    <>
      <h1 className="h3">Órdenes / Boletas</h1>
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por nro, código, cliente o correo"
            aria-label="Buscar órdenes"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="fallido">Fallido</option>
          </select>
        </div>
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr><th>Nro</th><th>Fecha</th><th>Cliente</th><th className="text-end">Total</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan="6" className="text-center text-muted py-4">No hay órdenes que mostrar.</td></tr>
            )}
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{new Date(p.fecha).toLocaleString('es-CL')}</td>
                <td>{p.cliente.nombre} {p.cliente.apellido}<div className="small text-muted">{p.cliente.correo}</div></td>
                <td className="text-end">{clp(p.total)}</td>
                <td><EstadoBadge estado={p.estado} /></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => onVerBoleta(p.id)}>Ver boleta</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Detalle de una orden (boleta)
export function AdminBoleta({ pedido, onVolver }) {
  if (!pedido) {
    return (
      <>
        <p className="text-muted">La orden no existe.</p>
        <button className="btn btn-dark" onClick={onVolver}>Volver</button>
      </>
    );
  }
  return (
    <div className="card border-0 shadow-sm p-4">
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <h1 className="h4 mb-0">Boleta nro #{pedido.id} <EstadoBadge estado={pedido.estado} /></h1>
        <span className="text-muted small">Código orden: {pedido.codigo} · {new Date(pedido.fecha).toLocaleString('es-CL')}</span>
      </div>
      <div className="mt-3">
        <DatosEnvio datos={{ ...pedido.cliente, ...pedido.envio }} readOnly />
      </div>
      <div className="mt-4"><TablaResumen items={pedido.items} /></div>
      <div className="bg-light rounded text-center fs-5 fw-bold py-3 my-3">Total: {clp(pedido.total)}</div>
      <div className="d-flex gap-2 no-print">
        <button className="btn btn-danger" onClick={() => window.print()}>Imprimir boleta en PDF</button>
        <button className="btn btn-outline-dark" onClick={onVolver}>Volver a órdenes</button>
      </div>
    </div>
  );
}
