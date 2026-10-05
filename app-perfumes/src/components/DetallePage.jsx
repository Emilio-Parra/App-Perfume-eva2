import React from 'react';

export const DetallePage = ({ producto, onVolver, onAgregar }) => {
  if (!producto) return null;

  const { id, marca, modelo, nombre, tipo, categoria, genero, volumen, precio, imagenes, descripcion } = producto;
  const titulo = modelo || nombre;
  const tagTipo = tipo || categoria;

  return (
    <main className="container my-5 flex-grow-1">
      {/* Botón para regresar al catálogo */}
      <button className="btn btn-outline-dark mb-4 fw-semibold" onClick={onVolver}>
        ← Volver al catálogo
      </button>

      <div className="card border-0 shadow-sm p-4">
        <div className="row align-items-center g-5">
          {/* Imagen principal */}
          <div className="col-md-5 text-center bg-light rounded p-4">
            <img
              src={imagenes}
              alt={titulo}
              className="img-fluid"
              style={{ maxHeight: '380px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/350x350?text=Sin+Imagen';
              }}
            />
          </div>

          {/* Información por ID */}
          <div className="col-md-7">
            <div className="mb-2">
              {tagTipo && (
                <span className="badge bg-warning text-dark text-uppercase me-2 fw-bold fs-7">
                  {tagTipo}
                </span>
              )}
              {genero && (
                <span className="badge bg-secondary text-uppercase fs-7">
                  {genero}
                </span>
              )}
            </div>

            <small className="text-muted text-uppercase fw-bold d-block mb-1">
              Código Producto ID: #{id} | Marca: {marca}
            </small>

            <h1 className="fw-bold text-dark display-5 mb-3">{titulo}</h1>

            <p className="text-muted fs-5 mb-2">
              <strong>Presentación:</strong> {volumen || '100 ml'}
            </p>

            {descripcion && (
              <p className="text-secondary my-3">{descripcion}</p>
            )}

            <div className="my-4">
              <span className="display-6 fw-bold text-dark">
                ${precio ? precio.toLocaleString('es-CL') : 0}
              </span>
            </div>

            <div className="d-flex gap-3 mt-4">
              <button
                className="btn btn-dark btn-lg fw-bold px-4 py-3"
                onClick={() => onAgregar(producto)}
              >
                🛒 Añadir al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};