import React from 'react';
import { ProductoCard } from './ProductoCard';

// Quita tildes y pasa a minúsculas para comparar sin errores ("diseñador" vs "Diseñador")
const normalizar = (texto = '') =>
  String(texto)
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const CATEGORIAS = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'arabe', etiqueta: 'Árabes' },
  { valor: 'diseñador', etiqueta: 'Diseñador' },
  { valor: 'nicho', etiqueta: 'Nicho' },
];

const GENEROS = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'hombre', etiqueta: 'Hombre' },
  { valor: 'mujer', etiqueta: 'Mujer' },
  { valor: 'unisex', etiqueta: 'Unisex' },
];

const coincideCategoria = (p, categoria) =>
  categoria === 'todas' || normalizar(p.tipo || p.categoria) === normalizar(categoria);

const coincideGenero = (p, genero) =>
  genero === 'todos' || normalizar(p.genero) === normalizar(genero);

export const CatalogoPage = ({
  productos,
  filtroCategoria,
  onCambiarCategoria,
  filtroGenero,
  onCambiarGenero,
  onAgregar,
  onVerDetalle,
}) => {
  const productosFiltrados = productos.filter(
    (p) => coincideCategoria(p, filtroCategoria) && coincideGenero(p, filtroGenero)
  );

  const hayFiltrosActivos = filtroCategoria !== 'todas' || filtroGenero !== 'todos';

  const limpiarFiltros = () => {
    onCambiarCategoria('todas');
    onCambiarGenero('todos');
  };

  return (
    <main className="container my-5 flex-grow-1">
      <h1 className="text-center fw-bold mb-4 display-5 text-dark text-uppercase">
        Catálogo
      </h1>

      {/* Filtro por categoría */}
      <div className="mb-3">
        <p className="text-center text-muted small fw-semibold text-uppercase mb-2">
          Categoría
        </p>
        <div className="d-flex justify-content-center flex-wrap gap-2">
          {CATEGORIAS.map(({ valor, etiqueta }) => {
            // El contador respeta el filtro de género activo
            const cantidad = productos.filter(
              (p) => coincideCategoria(p, valor) && coincideGenero(p, filtroGenero)
            ).length;
            return (
              <button
                key={valor}
                type="button"
                className={`btn ${filtroCategoria === valor ? 'btn-dark' : 'btn-outline-dark'} fw-semibold px-3`}
                onClick={() => onCambiarCategoria(valor)}
              >
                {etiqueta} <span className="badge bg-secondary ms-1">{cantidad}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro por género */}
      <div className="mb-4">
        <p className="text-center text-muted small fw-semibold text-uppercase mb-2">
          Género
        </p>
        <div className="d-flex justify-content-center flex-wrap gap-2">
          {GENEROS.map(({ valor, etiqueta }) => (
            <button
              key={valor}
              type="button"
              className={`btn btn-sm ${filtroGenero === valor ? 'btn-warning' : 'btn-outline-secondary'} fw-semibold px-3`}
              onClick={() => onCambiarGenero(valor)}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">
          {productosFiltrados.length}{' '}
          {productosFiltrados.length === 1 ? 'producto' : 'productos'}
        </small>
        {hayFiltrosActivos && (
          <button type="button" className="btn btn-link btn-sm text-dark" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </div>

      {productosFiltrados.length === 0 ? (
        <p className="text-center text-muted fs-5 my-5">
          No hay productos disponibles para este filtro.
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {productosFiltrados.map((prod) => (
            <ProductoCard
              key={prod.id}
              producto={prod}
              onAgregar={onAgregar}
              onVerDetalle={onVerDetalle}
            />
          ))}
        </div>
      )}
    </main>
  );
};
