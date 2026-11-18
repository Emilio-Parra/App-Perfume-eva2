import React, { useState } from 'react';
import { ProductoCard } from './ProductoCard';
import { enOferta, porcentajeDescuento, precioFinal } from '../utils/precios';

const ORDENES = [
  { valor: 'descuento', etiqueta: 'Mayor descuento' },
  { valor: 'precio-asc', etiqueta: 'Menor precio' },
  { valor: 'precio-desc', etiqueta: 'Mayor precio' },
];

const comparar = {
  descuento: (a, b) => porcentajeDescuento(b) - porcentajeDescuento(a),
  'precio-asc': (a, b) => precioFinal(a) - precioFinal(b),
  'precio-desc': (a, b) => precioFinal(b) - precioFinal(a),
};

// Catálogo de ofertas: solo productos con descuento, ordenables
export const OfertasPage = ({ productos, onAgregar, onVerDetalle }) => {
  const [orden, setOrden] = useState('descuento');
  const ofertas = productos.filter(enOferta).sort(comparar[orden]);

  return (
    <main className="container my-5 flex-grow-1">
      <h1 className="text-center fw-bold mb-2 display-5 text-dark text-uppercase">Ofertas</h1>
      <p className="text-center text-muted mb-4">Fragancias originales con precio especial por tiempo limitado.</p>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <small className="text-muted">
          {ofertas.length} {ofertas.length === 1 ? 'oferta' : 'ofertas'}
        </small>
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="orden-ofertas" className="small text-muted mb-0">Ordenar por</label>
          <select
            id="orden-ofertas"
            className="form-select form-select-sm w-auto"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            {ORDENES.map(({ valor, etiqueta }) => (
              <option key={valor} value={valor}>{etiqueta}</option>
            ))}
          </select>
        </div>
      </div>

      {ofertas.length === 0 ? (
        <p className="text-center text-muted fs-5 my-5">No hay ofertas disponibles por el momento.</p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {ofertas.map((prod) => (
            <ProductoCard key={prod.id} producto={prod} onAgregar={onAgregar} onVerDetalle={onVerDetalle} />
          ))}
        </div>
      )}
    </main>
  );
};
