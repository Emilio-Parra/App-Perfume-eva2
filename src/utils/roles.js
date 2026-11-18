// Roles del sistema y qué puede ver cada uno en el panel.
//
//  admin    -> acceso total al panel
//  vendedor -> solo productos (listado y detalle) y órdenes (listado y detalle)
//  cliente  -> solo la tienda (no entra al panel)
//
// Esto solo oculta opciones en la pantalla. La seguridad real está en el
// backend (Spring Security + JWT): aunque alguien fuerce una vista, la API
// responde 403 si su rol no tiene permiso.

export const ROLES = {
  ADMIN: 'admin',
  VENDEDOR: 'vendedor',
  CLIENTE: 'cliente',
};

export const esAdmin = (usuario) => usuario?.rol === ROLES.ADMIN;
export const esVendedor = (usuario) => usuario?.rol === ROLES.VENDEDOR;

// Admin y vendedor usan el panel interno
export const usaPanel = (usuario) => esAdmin(usuario) || esVendedor(usuario);

// Vistas del panel permitidas al vendedor
export const VISTAS_VENDEDOR = ['ordenes', 'boleta', 'productos', 'producto-criticos', 'producto-detalle'];

export const puedeVerVista = (usuario, vista) =>
  esAdmin(usuario) || (esVendedor(usuario) && VISTAS_VENDEDOR.includes(vista));

// Vista inicial del panel según el rol
export const vistaInicial = (usuario) => (esVendedor(usuario) ? 'ordenes' : 'dashboard');

export const nombrePanel = (usuario) => (esVendedor(usuario) ? 'Vendedor' : 'Admin');
