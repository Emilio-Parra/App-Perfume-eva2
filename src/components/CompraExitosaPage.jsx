import React, { useState } from 'react';
import { BoletaProfesional } from './BoletaProfesional';

export const CompraExitosaPage = ({ pedido, onSeguirComprando }) => {
  const [boletaEnviada, setBoletaEnviada] = useState(false);
  if (!pedido) return null;

  const datos = { ...pedido.cliente, ...pedido.envio };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-xl-8">
          <div className="mb-4 no-print">
            <h1 className="h3 fw-bold text-success mb-1">✓ ¡Compra realizada!</h1>
            <p className="text-muted mb-0">Tu pedido fue registrado correctamente. Aquí tienes tu comprobante.</p>
          </div>
          <BoletaProfesional pedido={pedido} />
          <div className="mt-4 no-print">
            {boletaEnviada && (
              <div className="alert alert-success py-2 small no-print" role="status">
                Boleta enviada a <strong>{pedido.cliente.correo}</strong> (envío simulado).
              </div>
            )}

            <div className="d-flex justify-content-center flex-wrap gap-2 no-print">
              <button className="btn btn-danger" onClick={() => window.print()}>
                Imprimir / Guardar como PDF
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
