import React from 'react';
import { ProductoCard } from './ProductoCard';
import { enOferta, porcentajeDescuento } from '../utils/precios';

// Sección del Inicio: las 4 mejores ofertas y un acceso al catálogo completo de ofertas
export const OfertasDestacadas = ({ productos, onAgregar, onVerDetalle, onVerTodas }) => {
  const destacadas = productos
    .filter(enOferta)
    .sort((a, b) => porcentajeDescuento(b) - porcentajeDescuento(a))
    .slice(0, 4);

  if (destacadas.length === 0) return null;

  return (
    <section className="container my-5">
      <h2 className="text-center fw-bold mb-4 text-uppercase">🔥 Ofertas destacadas</h2>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {destacadas.map((prod) => (
          <ProductoCard key={prod.id} producto={prod} onAgregar={onAgregar} onVerDetalle={onVerDetalle} />
        ))}
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-danger px-4" onClick={onVerTodas}>
          Ver todas las ofertas
        </button>
      </div>
    </section>
  );
};
