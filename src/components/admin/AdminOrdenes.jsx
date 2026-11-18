
import React, { useState } from 'react';
import { BoletaProfesional } from '../BoletaProfesional';
import { clp } from '../../utils/formato';

const BADGE = {
  pagado: 'success',
  fallido: 'danger',
  pendiente: 'secondary'
};

export const EstadoBadge = ({ estado }) => (
  <span
    className={`badge text-bg-${BADGE[estado] || 'secondary'} text-capitalize`}
  >
    {estado}
  </span>
);

// Obtener el nombre del cliente si está disponible
const mostrarCliente = (pedido) => {
  if (pedido.cliente) {
    const nombre = pedido.cliente.nombre || '';
    const apellido = pedido.cliente.apellido || '';

    return `${nombre} ${apellido}`.trim();
  }

  return `Cliente #${pedido.usuarioId ?? 'N/D'}`;
};

// Listado de órdenes del administrador
export function AdminOrdenes({ pedidos = [], onVerBoleta }) {
  const [estado, setEstado] = useState('todos');
  const [texto, setTexto] = useState('');

  const q = texto.trim().toLowerCase();

  const filtrados = [...pedidos]
    .reverse()
    .filter(
      (p) => estado === 'todos' || p.estado === estado
    )
    .filter((p) => {
      if (!q) return true;

      const numero = String(p.id);
      const codigo = String(p.codigo || '').toLowerCase();
      const cliente = mostrarCliente(p).toLowerCase();
      const correo = String(
        p.cliente?.correo || ''
      ).toLowerCase();

      return (
        numero.includes(q) ||
        codigo.includes(q) ||
        cliente.includes(q) ||
        correo.includes(q)
      );
    });

  return (
    <>
      <h1 className="h3">Órdenes / Boletas</h1>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por nro, código o cliente"
            aria-label="Buscar órdenes"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            aria-label="Filtrar por estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
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
            <tr>
              <th>Nro</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th className="text-end">Total</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-muted py-4"
                >
                  No hay órdenes que mostrar.
                </td>
              </tr>
            )}

            {filtrados.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>

                <td>
                  {new Date(p.fecha).toLocaleString('es-CL')}
                </td>

                <td>
                  {mostrarCliente(p)}

                  {p.cliente?.correo && (
                    <div className="small text-muted">
                      {p.cliente.correo}
                    </div>
                  )}
                </td>

                <td className="text-end">
                  {clp(p.total)}
                </td>

                <td>
                  <EstadoBadge estado={p.estado} />
                </td>

                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onVerBoleta(p.id)}
                  >
                    Ver boleta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Comprobante profesional para ver e imprimir una orden del administrador.
export function AdminBoleta({ pedido, onVolver }) {
  if (!pedido) {
    return <>
      <p className="text-muted">La orden no existe.</p>
      <button className="btn btn-dark" onClick={onVolver}>Volver</button>
    </>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3 no-print">
        <h1 className="h4 m-0">Comprobante del pedido #{pedido.id}</h1>
        <button className="btn btn-outline-dark btn-sm" onClick={onVolver}>Volver a órdenes</button>
      </div>
      <BoletaProfesional pedido={pedido} />
      <div className="d-flex justify-content-end mt-3 gap-2 no-print">
        <button className="btn btn-dark" type="button" onClick={() => window.print()}>
          Imprimir / Guardar como PDF
        </button>
      </div>
    </>
  );
}
