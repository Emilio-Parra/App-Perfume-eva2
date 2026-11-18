import React from 'react';
import { ProductoCard } from './ProductoCard';
import { clp } from '../utils/formato';

export const CarritoPage = ({
  carrito,
  productos,
  onAgregar,
  onCambiarCantidad,
  onEliminar,
  onVaciar,
  onComprar,
  onVerDetalle,
  onIrACatalogo,
}) => {
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row g-4">
        {/* Lista de productos (a la izquierda en escritorio, debajo del carrito en móvil) */}
        <section className="col-lg-5 order-2 order-lg-1">
          <h2 className="h4 fw-bold mb-3">Lista de productos</h2>
          <div className="lista-productos-carrito">
            <div className="row row-cols-1 row-cols-sm-2 g-3 me-lg-1">
              {productos.map((prod) => (
                <ProductoCard
                  key={prod.id}
                  producto={prod}
                  onAgregar={onAgregar}
                  onVerDetalle={onVerDetalle}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Carrito de compras */}
        <section className="col-lg-7 order-1 order-lg-2">
          <h2 className="h4 fw-bold mb-3">Carrito de Compras</h2>

          {carrito.length === 0 ? (
            <div className="card border-0 shadow-sm p-4 text-center">
              <p className="text-muted fs-5 mb-3">Tu carrito está vacío.</p>
              <div>
                <button className="btn btn-dark px-4" onClick={onIrACatalogo}>
                  Ir al catálogo
                </button>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm p-3">
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th className="text-end">Precio</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((item) => {
                      const nombre = item.modelo || item.nombre;
                      return (
                        <tr key={item.id}>
                          <td>
                            <img
                              src={item.imagenes}
                              alt={nombre}
                              width="44"
                              height="44"
                              style={{ objectFit: 'contain' }}
                            />
                          </td>
                          <td>
                            <small className="text-muted text-uppercase d-block">{item.marca}</small>
                            {nombre}
                          </td>
                          <td className="text-end">{clp(item.precio)}</td>
                          <td className="text-center text-nowrap">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => onCambiarCantidad(item.id, -1)}
                              disabled={item.cantidad <= 1}
                              aria-label={`Quitar una unidad de ${nombre}`}
                            >
                              −
                            </button>
                            <span className="mx-2 fw-semibold">{item.cantidad}</span>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => onCambiarCantidad(item.id, 1)}
                              aria-label={`Agregar una unidad de ${nombre}`}
                            >
                              +
                            </button>
                          </td>
                          <td className="text-end">{clp(item.precio * item.cantidad)}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => onEliminar(item.id)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="table-light">
                      <td colSpan="4" className="text-end fw-bold">Total</td>
                      <td className="text-end fw-bold">{clp(total)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-secondary" onClick={onVaciar}>
                  Limpiar
                </button>
                <button className="btn btn-success fw-semibold" onClick={onComprar}>
                  Comprar ahora
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
