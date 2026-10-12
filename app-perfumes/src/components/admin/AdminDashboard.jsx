import React from 'react';
import { esCritico } from '../../service/productosService';

const MODULOS = [
  { vista: 'dashboard', icono: '📊', titulo: 'Dashboard', texto: 'Visión general de todas las métricas y estadísticas clave.' },
  { vista: 'ordenes', icono: '🛒', titulo: 'Órdenes', texto: 'Gestión y seguimiento de todas las órdenes de compra realizadas.' },
  { vista: 'productos', icono: '📦', titulo: 'Productos', texto: 'Administrar inventario y detalles de los productos disponibles.' },
  { vista: 'categorias', icono: '🏷️', titulo: 'Categorías', texto: 'Organizar productos en categorías para facilitar su navegación.' },
  { vista: 'usuarios', icono: '👥', titulo: 'Usuarios', texto: 'Gestión de cuentas de usuario y sus roles dentro del sistema.' },
  { vista: 'reportes', icono: '📈', titulo: 'Reportes', texto: 'Generación de informes detallados sobre las operaciones del sistema.' },
  { vista: 'perfil', icono: '🙍', titulo: 'Perfil', texto: 'Administración de la información personal y configuraciones de cuenta.' },
  { vista: 'tienda', icono: '🏬', titulo: 'Tienda', texto: 'Visualiza tu tienda en tiempo real, visualiza los reportes de los usuarios.' },
];

export function AdminDashboard({ productos, pedidos, usuarios, onIr, onIrATienda }) {
  const compras = pedidos.filter((p) => p.estado === 'pagado');
  const stockTotal = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const criticos = productos.filter(esCritico).length;
  const clientes = usuarios.filter((u) => u.rol !== 'admin').length;

  const abrir = (vista) => (vista === 'tienda' ? onIrATienda() : onIr(vista));

  return (
    <>
      <h1 className="h3 mb-0">Dashboard</h1>
      <p className="text-muted">Resumen de las actividades diarias</p>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary border-0 h-100 shadow-sm">
            <div className="card-body">
              <div className="small">🛒 Compras</div>
              <div className="display-6 fw-bold">{compras.length}</div>
              <div className="small mt-2">{pedidos.length - compras.length} pendientes o fallidas</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success border-0 h-100 shadow-sm">
            <div className="card-body">
              <div className="small">📦 Productos</div>
              <div className="display-6 fw-bold">{productos.length}</div>
              <div className="small mt-2">Inventario actual: {stockTotal} · {criticos} en stock crítico</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning border-0 h-100 shadow-sm">
            <div className="card-body">
              <div className="small">👥 Usuarios</div>
              <div className="display-6 fw-bold">{usuarios.length}</div>
              <div className="small mt-2">{clientes} clientes · {usuarios.length - clientes} admin</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
        {MODULOS.map((m) => (
          <div className="col" key={m.vista}>
            <button
              className="card h-100 w-100 border-0 shadow-sm text-center p-3 bg-white"
              onClick={() => abrir(m.vista)}
            >
              <div className="fs-3 text-primary" aria-hidden="true">{m.icono}</div>
              <div className="fw-semibold">{m.titulo}</div>
              <div className="small text-muted">{m.texto}</div>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
