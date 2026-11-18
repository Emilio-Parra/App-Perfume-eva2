import React, { useState } from 'react';

// Menú lateral del panel. "grupo" resalta el ítem aunque se esté en una sub-vista.
const MENU = [
  { vista: 'dashboard', etiqueta: 'Dashboard', icono: '📊', grupo: ['dashboard'] },
  { vista: 'ordenes', etiqueta: 'Órdenes', icono: '🧾', grupo: ['ordenes', 'boleta'] },
  { vista: 'productos', etiqueta: 'Productos', icono: '📦', grupo: ['productos', 'producto-nuevo', 'producto-editar', 'producto-criticos', 'producto-reportes'] },
  { vista: 'categorias', etiqueta: 'Categorías', icono: '🏷️', grupo: ['categorias'] },
  { vista: 'usuarios', etiqueta: 'Usuarios', icono: '👥', grupo: ['usuarios', 'usuario-nuevo', 'usuario-editar', 'usuario-historial'] },
  { vista: 'reportes', etiqueta: 'Reportes', icono: '📈', grupo: ['reportes'] },
];

export function AdminLayout({ vista, onIr, onIrATienda, onCerrarSesion, usuario, children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const ir = (v) => {
    onIr(v);
    setMenuAbierto(false);
  };

  const itemClase = (activo) =>
    `btn text-start w-100 mb-1 ${activo ? 'btn-primary' : 'btn-light text-dark border-0'}`;

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <header className="navbar navbar-dark bg-dark px-3 no-print">
        <span className="navbar-brand fw-bold text-warning mb-0">✨ Perfumes Store · Admin</span>
        <div className="d-flex align-items-center gap-2">
          <span className="text-light small d-none d-sm-inline">{usuario?.nombre}</span>
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </header>

      <div className="container-fluid flex-grow-1">
        <div className="row h-100">
          <aside className={`col-lg-2 col-md-12 bg-white border-end py-3 no-print ${menuAbierto ? '' : 'd-none d-lg-block'}`}>
            <nav aria-label="Menú de administración">
              {MENU.map((m) => (
                <button
                  key={m.vista}
                  className={itemClase(m.grupo.includes(vista))}
                  onClick={() => ir(m.vista)}
                >
                  <span className="me-2" aria-hidden="true">{m.icono}</span>{m.etiqueta}
                </button>
              ))}
              <hr />
              <button className={itemClase(vista === 'perfil')} onClick={() => ir('perfil')}>
                <span className="me-2" aria-hidden="true">👤</span>Perfil
              </button>
              <button className="btn btn-dark w-100 mb-1 mt-3" onClick={onIrATienda}>🏬 Tienda</button>
              <button className="btn btn-danger w-100" onClick={onCerrarSesion}>⏻ Cerrar Sesión</button>
            </nav>
          </aside>

          <main className="col-lg-10 col-12 p-3 p-md-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
