import React, { useState } from 'react';
import { BuscadorNavbar } from './BuscadorNavbar';

// Un solo enlace "Catálogo": las categorías se filtran dentro de esa página
const ENLACES = [
  { pagina: 'inicio', etiqueta: 'Inicio' },
  { pagina: 'catalogo', etiqueta: 'Catálogo' },
  { pagina: 'tiendas', etiqueta: 'Tiendas' },
  { pagina: 'contacto', etiqueta: 'Contacto' },
];

export function Navbar({ 
  totalItems, 
  totalMonto, 
  paginaActual, 
  onNavegar, 
  usuarioActual, 
  onCerrarSesion,
  textoBusqueda = '',
  onBuscar = () => {}
}) {
  // Estado para controlar la apertura/cierre del menú hamburguesa en móviles
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleBuscar = (texto) => {
    onBuscar(texto);
    setIsNavOpen(false);
  };

  const handleNavClick = (cat) => {
    onNavegar(cat);
    setIsNavOpen(false); // Cierra automáticamente el menú al hacer clic en una opción
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top no-print">
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
            {ENLACES.map(({ pagina, etiqueta }) => (
              <li className="nav-item" key={pagina}>
                <button
                  className={`nav-link btn btn-link text-decoration-none text-start w-100 ${paginaActual === pagina ? 'active fw-bold text-warning' : ''}`}
                  onClick={() => handleNavClick(pagina)}
                >
                  {etiqueta}
                </button>
              </li>
            ))}
          </ul>

          {/* Buscador de productos */}
          <BuscadorNavbar key={textoBusqueda} textoInicial={textoBusqueda} onBuscar={handleBuscar} />

          {/* Botones de Sesión y Carrito */}
          <div className="d-flex flex-wrap align-items-center gap-2 mt-2 mt-lg-0 pb-2 pb-lg-0">
            {usuarioActual ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-light small">
                  👤 Hola, <strong>{usuarioActual.nombre || usuarioActual.correo}</strong>
                </span>
                {usuarioActual.rol === 'admin' && (
                  <button
                    className="btn btn-warning btn-sm fw-bold"
                    onClick={() => handleNavClick('admin')}
                  >
                    Panel admin
                  </button>
                )}
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
              className={`btn btn-warning position-relative ms-lg-2 ${paginaActual === 'carrito' ? 'border border-dark border-2' : ''}`} 
              type="button" 
              onClick={() => handleNavClick('carrito')}
            >
              🛒 Carrito {totalMonto > 0 && `$${totalMonto.toLocaleString('es-CL')}`}
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