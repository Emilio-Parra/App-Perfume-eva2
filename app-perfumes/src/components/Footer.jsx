import React from 'react';

export const Footer = ({ onNavegar }) => {
  const ir = (e, pagina, categoria) => {
    e.preventDefault();
    onNavegar(pagina, categoria);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer mt-5">
      <div className="footer-top-bar">
        🚚 ENVÍOS GRATIS A TODO CHILE POR COMPRAS SOBRE $50.000
      </div>
      <div className="footer-content">
        <div className="footer-container">
          <div className="footer-col footer-brand">
            <h4 className="fw-bold text-warning">✨ Perfumes Store</h4>
            <p className="text-muted small">
              Tu tienda de confianza con las mejores fragancias árabes, de diseñador y nicho.
            </p>
          </div>
          <div className="footer-col">
            <h4>Navegación</h4>
            <ul>
              <li><a href="#inicio" onClick={(e) => ir(e, 'inicio')}>Inicio</a></li>
              <li><a href="#catalogo" onClick={(e) => ir(e, 'catalogo')}>Catálogo</a></li>
              <li><a href="#arabes" onClick={(e) => ir(e, 'catalogo', 'arabe')}>Árabes</a></li>
              <li><a href="#disenador" onClick={(e) => ir(e, 'catalogo', 'diseñador')}>Diseñador</a></li>
              <li><a href="#nicho" onClick={(e) => ir(e, 'catalogo', 'nicho')}>Nicho</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Información</h4>
            <ul>
              <li><a href="#tiendas" onClick={(e) => ir(e, 'tiendas')}>Nuestras Tiendas</a></li>
              <li><a href="#contacto" onClick={(e) => ir(e, 'contacto')}>Contacto</a></li>
              <li><a href="#terminos">Términos y Condiciones</a></li>
            </ul>
          </div>
          <div className="footer-col footer-newsletter">
            <h4>Boletín</h4>
            <p>Suscríbete para recibir ofertas exclusivas.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Tu email..." />
              <button type="submit">➔</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom text-center">
          <p>© 2026 Perfumes Store - Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};