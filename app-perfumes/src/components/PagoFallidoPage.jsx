import React from 'react';
import { TablaResumen } from './TablaResumen';
import { DatosEnvio } from './DatosEnvio';
import { clp } from '../utils/formato';

export const PagoFallidoPage = ({ pedido, procesando, onReintentar, onVolverAlCarrito }) => {
  if (!pedido) return null;

  const datos = { ...pedido.cliente, ...pedido.envio };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-xl-8">
          <div className="card border-0 shadow-sm p-4">
            <h2 className="h3 fw-bold mb-1">
              <span className="text-danger me-2" aria-hidden="true">✖</span>
              No se pudo realizar el pago. nro #{pedido.id}
            </h2>
            <p className="text-muted small mb-3">
              Detalle de compra · Intentos de pago: {pedido.intentos}
            </p>

            <div className="text-center mb-4">
              <button
                className="btn btn-success fw-bold text-uppercase px-4"
                onClick={onReintentar}
                disabled={procesando}
              >
                {procesando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    Procesando pago...
                  </>
                ) : (
                  'Volver a realizar el pago'
                )}
              </button>
            </div>

            <DatosEnvio datos={datos} readOnly />

            <div className="mt-4">
              <TablaResumen items={pedido.items} />
            </div>

            <div className="bg-light rounded text-center fs-5 fw-bold py-3 my-4">
              Total a pagar: {clp(pedido.total)}
            </div>

            <div className="text-center">
              <button
                className="btn btn-link text-secondary"
                onClick={onVolverAlCarrito}
                disabled={procesando}
              >
                ← Volver al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
