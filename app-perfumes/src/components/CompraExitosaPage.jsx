import React, { useState } from 'react';
import { TablaResumen } from './TablaResumen';
import { DatosEnvio } from './DatosEnvio';
import { clp } from '../utils/formato';

export const CompraExitosaPage = ({ pedido, onSeguirComprando }) => {
  const [boletaEnviada, setBoletaEnviada] = useState(false);
  if (!pedido) return null;

  const datos = { ...pedido.cliente, ...pedido.envio };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-xl-8">
          <div className="card border-0 shadow-sm p-4">
            <div className="text-end text-muted small">Código orden: {pedido.codigo}</div>
            <h2 className="h3 fw-bold mb-1">
              <span className="text-success me-2" aria-hidden="true">✔</span>
              Se ha realizado la compra. nro #{pedido.id}
            </h2>
            <p className="text-muted small mb-3">Resumen de tu compra</p>

            <DatosEnvio datos={datos} readOnly />

            <div className="mt-4">
              <TablaResumen items={pedido.items} />
            </div>

            <div className="bg-light rounded text-center fs-5 fw-bold py-3 my-4">
              Total pagado: {clp(pedido.total)}
            </div>

            {boletaEnviada && (
              <div className="alert alert-success py-2 small no-print" role="status">
                Boleta enviada a <strong>{pedido.cliente.correo}</strong> (envío simulado).
              </div>
            )}

            <div className="d-flex justify-content-center flex-wrap gap-2 no-print">
              <button className="btn btn-danger" onClick={() => window.print()}>
                Imprimir boleta en PDF
              </button>
              <button
                className="btn btn-success"
                onClick={() => setBoletaEnviada(true)}
                disabled={boletaEnviada}
              >
                {boletaEnviada ? 'Boleta enviada ✓' : 'Enviar boleta por email'}
              </button>
              <button className="btn btn-outline-dark" onClick={onSeguirComprando}>
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
