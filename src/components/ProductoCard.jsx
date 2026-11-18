import React from 'react';
import { enOferta, porcentajeDescuento, precioFinal } from '../utils/precios';

export const ProductoCard = ({ producto, onAgregar, onVerDetalle }) => {
  const { id, nombre, modelo, marca, precio, imagenes, categoria, tipo } = producto;
  const titulo = modelo || nombre;
  const tagCategoria = tipo || categoria;
  const oferta = enOferta(producto);

  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0 position-relative">
        {oferta && (
          <span className="badge bg-danger position-absolute top-0 start-0 m-2 fs-6" style={{ zIndex: 1 }}>
            -{porcentajeDescuento(producto)}%
          </span>
        )}
        <div 
          style={{ cursor: 'pointer' }} 
          onClick={() => onVerDetalle(producto)}
          title="Haz clic para ver el detalle"
        >
          <img
            src={imagenes}
            className="card-img-top p-3"
            alt={titulo}
            style={{ height: '220px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/260x260?text=Sin+Imagen';
            }}
          />
        </div>
        <div className="card-body d-flex flex-column text-center">
          {tagCategoria && (
            <span className="badge bg-light text-secondary mb-2 align-self-center text-uppercase fs-7">
              {tagCategoria}
            </span>
          )}
          <small className="text-muted text-uppercase fw-bold">{marca}</small>
          <h5 
            className="card-title fw-bold text-dark text-truncate" 
            style={{ cursor: 'pointer' }}
            onClick={() => onVerDetalle(producto)}
          >
            {titulo}
          </h5>
          <p className="fs-5 fw-bold text-dark mt-auto mb-3">
            {oferta && (
              <small className="text-muted text-decoration-line-through fw-normal me-2">
                ${precio.toLocaleString('es-CL')}
              </small>
            )}
            <span className={oferta ? 'text-danger' : ''}>
              ${precioFinal(producto).toLocaleString('es-CL')}
            </span>
          </p>
          <button
            className="btn btn-dark w-100 py-2 fw-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onAgregar(producto);
            }}
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
};