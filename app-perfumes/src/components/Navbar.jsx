import React, { useState } from 'react';

export function Navbar({ 
  totalItems, 
  onOpenCart, 
  categoriaActual, 
  onSeleccionarCategoria, 
  usuarioActual, 
  onCerrarSesion 
}) {
  // Estado para controlar la apertura/cierre del menú hamburguesa en móviles
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleNavClick = (cat) => {
    onSeleccionarCategoria(cat);
    setIsNavOpen(false); // Cierra automáticamente el menú al hacer clic en una opción
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        <a 
          className="navbar-brand fw-bold text-warning d-flex align-items-center gap-2"
          style={{ cursor: 'pointer' }}
          onClick={() => handleNavClick('inicio')}
        >
          ✨ Perfumes Store
        </a>

        {/* Botón Hamburguesa controlado por React */}
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleNav}
          aria-controls="navbarNav"
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menú colapsable con clase condicional 'show' */}
        <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 mt-2 mt-lg-0">
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none text-start w-100 ${categoriaActual === 'inicio' ? 'active fw-bold text-warning' : ''}`}
                onClick={() => handleNavClick('inicio')}
              >
                Inicio
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none text-start w-100 ${categoriaActual === 'todos' ? 'active fw-bold text-warning' : ''}`}
                onClick={() => handleNavClick('todos')}
              >
                Catálogo
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none text-start w-100 ${categoriaActual === 'arabe' ? 'active fw-bold text-warning' : ''}`}
                onClick={() => handleNavClick('arabe')}
              >
                Árabes
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none text-start w-100 ${categoriaActual === 'diseñador' ? 'active fw-bold text-warning' : ''}`}
                onClick={() => handleNavClick('diseñador')}
              >
                Diseñador
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none text-start w-100 ${categoriaActual === 'nicho' ? 'active fw-bold text-warning' : ''}`}
                onClick={() => handleNavClick('nicho')}
              >
                Nichos
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none text-start w-100 ${categoriaActual === 'tiendas' ? 'active fw-bold text-warning' : ''}`}
                onClick={() => handleNavClick('tiendas')}
              >
                Tiendas
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-decoration-none text-start w-100 ${categoriaActual === 'contacto' ? 'active fw-bold text-warning' : ''}`}
                onClick={() => handleNavClick('contacto')}
              >
                Contacto
              </button>
            </li>
          </ul>

          {/* Botones de Sesión y Carrito */}
          <div className="d-flex flex-wrap align-items-center gap-2 mt-2 mt-lg-0 pb-2 pb-lg-0">
            {usuarioActual ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-light small">
                  👤 Hola, <strong>{usuarioActual.nombre || usuarioActual.correo}</strong>
                </span>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    onCerrarSesion();
                    setIsNavOpen(false);
                  }}
                >
                  Salir
                </button>
              </div>
            ) : (
              <>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={() => handleNavClick('login')}
                >
                  Iniciar Sesión
                </button>
                <button 
                  className="btn btn-warning btn-sm fw-bold"
                  onClick={() => handleNavClick('registro')}
                >
                  Registrarse
                </button>
              </>
            )}

            <button 
              className="btn btn-warning position-relative ms-lg-2" 
              type="button" 
              onClick={() => {
                onOpenCart();
                setIsNavOpen(false);
              }}
            >
              🛒 Carrito
              {totalItems > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}