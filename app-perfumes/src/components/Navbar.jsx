import React from 'react';

export const Navbar = ({ totalItems, onOpenCart, categoriaActual, onSeleccionarCategoria }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3">
      <div className="container">
        <button 
          className="navbar-brand btn btn-link text-warning fw-bold fs-4 text-decoration-none p-0 border-0" 
          onClick={() => onSeleccionarCategoria('inicio')}
        >
          ✨ Perfumes Store
        </button>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-semibold">
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none ${categoriaActual === 'inicio' ? 'active text-warning fw-bold' : ''}`}
                onClick={() => onSeleccionarCategoria('inicio')}
              >
                Inicio
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none ${categoriaActual === 'todos' ? 'active text-warning fw-bold' : ''}`}
                onClick={() => onSeleccionarCategoria('todos')}
              >
                Catálogo completo
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none ${categoriaActual === 'arabe' ? 'active text-warning fw-bold' : ''}`}
                onClick={() => onSeleccionarCategoria('arabe')}
              >
                Árabes
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none ${categoriaActual === 'diseñador' ? 'active text-warning fw-bold' : ''}`}
                onClick={() => onSeleccionarCategoria('diseñador')}
              >
                Diseñador
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none ${categoriaActual === 'nicho' ? 'active text-warning fw-bold' : ''}`}
                onClick={() => onSeleccionarCategoria('nicho')}
              >
                Nichos
              </button>
            </li>
          </ul>

          <button className="btn btn-warning position-relative fw-bold px-3" onClick={onOpenCart}>
            🛒 Carrito
            {totalItems > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger fs-7">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};