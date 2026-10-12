import React from 'react';
import { clp } from '../../utils/formato';
import { esCritico } from '../../service/productosService';

const Barra = ({ etiqueta, valor, max, texto, color = 'primary' }) => (
  <div className="mb-2">
    <div className="d-flex justify-content-between small">
      <span className="text-capitalize">{etiqueta}</span><strong>{texto}</strong>
    </div>
    <div className="progress" role="progressbar" aria-label={etiqueta} aria-valuenow={valor} aria-valuemin="0" aria-valuemax={max}>
      <div className={`progress-bar bg-${color}`} style={{ width: `${max ? (valor / max) * 100 : 0}%` }}></div>
    </div>
  </div>
);

const Tarjeta = ({ titulo, children }) => (
  <div className="col-lg-6">
    <div className="card border-0 shadow-sm h-100"><div className="card-body">
      <h2 className="h6 mb-3">{titulo}</h2>{children}
    </div></div>
  </div>
);

// Calcula las métricas a partir de pedidos pagados
export const calcularReporte = (productos, pedidos) => {
  const pagados = pedidos.filter((p) => p.estado === 'pagado');
  const ingresos = pagados.reduce((a, p) => a + p.total, 0);

  const vendidos = {};
  const porCategoria = {};
  const tipoDe = Object.fromEntries(productos.map((p) => [Number(p.id), p.tipo]));
  pagados.forEach((p) =>
    p.items.forEach((i) => {
      const nombre = `${i.marca} ${i.modelo}`;
      vendidos[nombre] = (vendidos[nombre] || 0) + i.cantidad;
      const cat = tipoDe[Number(i.id)] || 'sin categoría';
      porCategoria[cat] = (porCategoria[cat] || 0) + i.precio * i.cantidad;
    })
  );

  const estados = ['pagado', 'pendiente', 'fallido'].map((e) => ({ estado: e, n: pedidos.filter((p) => p.estado === e).length }));
  const top = Object.entries(vendidos).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const categorias = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);

  const valorInventario = productos.reduce((a, p) => a + p.precio * p.stock, 0);
  const inventarioPorCat = {};
  productos.forEach((p) => { inventarioPorCat[p.tipo] = (inventarioPorCat[p.tipo] || 0) + Number(p.stock); });

  return { pagados, ingresos, top, categorias, estados, valorInventario, inventarioPorCat, criticos: productos.filter(esCritico).length };
};

// alcance: 'general' (ventas) | 'productos' (inventario)
export function AdminReportes({ productos, pedidos, alcance = 'general' }) {
  const r = calcularReporte(productos, pedidos);
  const maxTop = r.top[0]?.[1] || 0;
  const maxCat = r.categorias[0]?.[1] || 0;
  const maxEst = Math.max(...r.estados.map((e) => e.n), 0);
  const inv = Object.entries(r.inventarioPorCat);
  const maxInv = Math.max(...inv.map(([, n]) => n), 0);

  return (
    <>
      <h1 className="h3">{alcance === 'productos' ? 'Reportes de productos' : 'Reportes'}</h1>
      <div className="row g-3 mb-3">
        {(alcance === 'productos'
          ? [['Productos', productos.length], ['Valor de inventario', clp(r.valorInventario)], ['Stock crítico', r.criticos]]
          : [['Ingresos (pagados)', clp(r.ingresos)], ['Órdenes pagadas', r.pagados.length], ['Ticket promedio', clp(r.pagados.length ? r.ingresos / r.pagados.length : 0)]]
        ).map(([t, v]) => (
          <div className="col-md-4" key={t}>
            <div className="card border-0 shadow-sm"><div className="card-body">
              <div className="small text-muted">{t}</div><div className="fs-4 fw-bold">{v}</div>
            </div></div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {alcance === 'productos' ? (
          <Tarjeta titulo="Stock por categoría">
            {inv.map(([c, n]) => <Barra key={c} etiqueta={c} valor={n} max={maxInv} texto={`${n} u.`} color="success" />)}
          </Tarjeta>
        ) : (
          <>
            <Tarjeta titulo="Órdenes por estado">
              {r.estados.map((e) => <Barra key={e.estado} etiqueta={e.estado} valor={e.n} max={maxEst} texto={e.n} color={e.estado === 'pagado' ? 'success' : e.estado === 'fallido' ? 'danger' : 'secondary'} />)}
            </Tarjeta>
            <Tarjeta titulo="Ventas por categoría">
              {r.categorias.length === 0 && <p className="text-muted small mb-0">Aún no hay ventas pagadas.</p>}
              {r.categorias.map(([c, v]) => <Barra key={c} etiqueta={c} valor={v} max={maxCat} texto={clp(v)} />)}
            </Tarjeta>
          </>
        )}
        <Tarjeta titulo="Productos más vendidos">
          {r.top.length === 0 && <p className="text-muted small mb-0">Aún no hay ventas pagadas.</p>}
          {r.top.map(([n, c]) => <Barra key={n} etiqueta={n} valor={c} max={maxTop} texto={`${c} u.`} color="warning" />)}
        </Tarjeta>
      </div>
      <div className="mt-3 no-print">
        <button className="btn btn-outline-dark" onClick={() => window.print()}>Imprimir reporte</button>
      </div>
    </>
  );
}
