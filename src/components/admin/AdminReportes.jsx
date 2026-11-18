import React, { useState } from 'react';
import { clp } from '../../utils/formato';
import { esCritico } from '../../service/productosService';

// Datos de pedidos reales que recibe AdminPage desde Spring Boot/MySQL.
const numero = (valor) => Number(valor) || 0;
const moneda = (valor) => clp(Math.round(numero(valor)));
const mesClave = (fecha) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

function fechaPedido(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : valor;
  // Spring Boot envía LocalDateTime en formato 2026-11-12T20:15:00.
  const fecha = new Date(String(valor).replace(' ', 'T'));
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

const formatoFecha = (valor) => {
  const fecha = fechaPedido(valor);
  return fecha ? fecha.toLocaleDateString('es-CL') : 'Sin fecha';
};
const formatoMes = (clave) => {
  const [anio, mes] = clave.split('-').map(Number);
  return new Date(anio, mes - 1, 1).toLocaleDateString('es-CL', {
    month: 'long', year: 'numeric'
  });
};
const nombreItem = (item) =>
  `${item.marca || ''} ${item.modelo || item.nombre || ''}`.trim() || 'Producto';
const nombreCliente = (pedido) => {
  const cliente = pedido.cliente || {};
  return `${cliente.nombre || pedido.clienteNombre || ''} ${cliente.apellido || pedido.clienteApellido || ''}`.trim() || 'Cliente no informado';
};

export function calcularReporte(productos = [], pedidos = [], periodo = mesClave(new Date())) {
  const todos = Array.isArray(pedidos) ? pedidos : [];
  const catalogo = Array.isArray(productos) ? productos : [];
  const pagados = todos.filter((p) => String(p.estado).toLowerCase() === 'pagado');
  const delMes = todos.filter((p) => {
    const fecha = fechaPedido(p.fecha);
    return fecha && mesClave(fecha) === periodo;
  });
  const pagadosMes = delMes.filter((p) => String(p.estado).toLowerCase() === 'pagado');
  const totalMes = pagadosMes.reduce((s, p) => s + numero(p.total), 0);
  const totalHistorico = pagados.reduce((s, p) => s + numero(p.total), 0);
  const unidadesMes = pagadosMes.reduce((s, p) =>
    s + (p.items || []).reduce((a, item) => a + numero(item.cantidad), 0), 0);

  const productoCategoria = Object.fromEntries(catalogo.map((p) => [String(p.id), p.tipo || 'Sin categoría']));
  const porCategoria = {};
  const porProducto = {};
  pagadosMes.forEach((pedido) => (pedido.items || []).forEach((item) => {
    const cantidad = numero(item.cantidad);
    const categoria = item.tipo || productoCategoria[String(item.id)] || 'Sin categoría';
    const producto = nombreItem(item);
    porCategoria[categoria] = (porCategoria[categoria] || 0) + numero(item.precio) * cantidad;
    porProducto[producto] = (porProducto[producto] || 0) + cantidad;
  }));

  const ventasCategoria = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
  const topProductos = Object.entries(porProducto).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const estados = ['pagado', 'pendiente', 'fallido'].map((estado) => ({
    estado, n: delMes.filter((p) => String(p.estado).toLowerCase() === estado).length
  }));
  const ultimas = [...pagadosMes]
    .sort((a, b) => numero(fechaPedido(b.fecha)?.getTime()) - numero(fechaPedido(a.fecha)?.getTime()))
    .slice(0, 8);

  const [anio, mes] = periodo.split('-').map(Number);
  const evolucion = Array.from({ length: 6 }, (_, i) => {
    const fecha = new Date(anio, mes - 1 - (5 - i), 1);
    const clave = mesClave(fecha);
    const ventas = pagados.filter((p) => {
      const f = fechaPedido(p.fecha);
      return f && mesClave(f) === clave;
    });
    return {
      clave,
      etiqueta: fecha.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' }),
      monto: ventas.reduce((s, p) => s + numero(p.total), 0),
      ordenes: ventas.length
    };
  });

  const stockPorCategoria = {};
  catalogo.forEach((p) => {
    const nombre = p.tipo || 'Sin categoría';
    stockPorCategoria[nombre] = (stockPorCategoria[nombre] || 0) + numero(p.stock);
  });
  const criticos = catalogo.filter(esCritico).sort((a, b) => numero(a.stock) - numero(b.stock));
  const inventario = catalogo.reduce((s, p) => s + numero(p.precio) * numero(p.stock), 0);
  return {
    pagados, ingresos: totalHistorico, top: topProductos, categorias: ventasCategoria,
    estados, valorInventario: inventario, inventarioPorCat: stockPorCategoria,
    criticos: criticos.length, detallesCriticos: criticos, ventasCategoria, topProductos,
    pagadosMes, totalMes, unidadesMes, totalHistorico, evolucion, ultimas,
    ticketMes: pagadosMes.length ? totalMes / pagadosMes.length : 0,
    periodo
  };
}

function Metrica({ titulo, valor, descripcion }) {
  return (
    <div className="col-sm-6 col-xl-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body py-3">
          <div className="small text-muted mb-2">{titulo}</div>
          <div className="fs-4 fw-semibold text-dark">{valor}</div>
          <div className="text-muted mt-1" style={{ fontSize: 12 }}>{descripcion}</div>
        </div>
      </div>
    </div>
  );
}
function Panel({ titulo, children, subtitulo }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body p-4">
        <h2 className="h6 fw-semibold mb-1">{titulo}</h2>
        {subtitulo && <p className="text-muted small mb-3">{subtitulo}</p>}
        {!subtitulo && <div className="mb-3" />}
        {children}
      </div>
    </div>
  );
}
function ListaBarras({ datos, formatear = String, vacio = 'No hay datos en este periodo.' }) {
  if (!datos.length) return <p className="small text-muted mb-0">{vacio}</p>;
  const mayor = Math.max(0, ...datos.map(([, n]) => numero(n)));
  return datos.map(([nombre, valor]) => (
    <div key={nombre} className="mb-3">
      <div className="d-flex justify-content-between gap-3 small mb-2">
        <span className="text-truncate">{nombre}</span><strong className="text-nowrap">{formatear(valor)}</strong>
      </div>
      <div className="progress" style={{ height: 5, backgroundColor: '#edf0f2' }}>
        <div className="progress-bar" style={{ width: `${mayor ? (numero(valor) / mayor) * 100 : 0}%`, backgroundColor: '#656d76' }} />
      </div>
    </div>
  ));
}

const cssDocumento = `
@page { size: A4; margin: 15mm 14mm; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; color: #20252b; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.report { max-width: 185mm; margin: 0 auto; }
.brand { font-size: 10pt; font-weight: 750; letter-spacing: 1.8px; text-transform: uppercase; }
.doc-type { font-size: 9pt; color: #63707b; text-transform: uppercase; letter-spacing: 1.5px; }
h1 { font-size: 22pt; font-weight: 700; line-height: 1.15; margin: 14px 0 6px; }
.subtitle { font-size: 10pt; color: #69737d; margin-bottom: 20px; }
.top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #20252b; padding-bottom: 14px; }
.meta { display:flex; gap:22px; font-size:9pt; color:#59636d; padding:14px 0 18px; border-bottom:1px solid #e0e4e8; }
.meta strong { color:#20252b; display:block; font-size:10pt; margin-top:3px; }
.grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:20px 0 22px; }
.kpi { border:1px solid #e0e4e8; padding:12px 10px; min-height:70px; }
.kpi small { color:#6b747c; display:block; font-size:8pt; line-height:1.3; }
.kpi strong { display:block; font-size:14pt; margin-top:8px; }
h2 { font-size:12pt; font-weight:700; margin:22px 0 10px; padding-bottom:7px; border-bottom:1px solid #cbd0d5; }
.columns { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
table { border-collapse:collapse; width:100%; font-size:9pt; }
th { background:#f2f4f5; padding:8px 7px; text-align:left; border-bottom:1px solid #d8dce0; font-weight:700; }
td { padding:8px 7px; border-bottom:1px solid #e5e8eb; vertical-align:top; }
th:last-child, td:last-child { text-align:right; white-space:nowrap; }
.right { text-align:right; }
.muted { color:#6b747c; }
.note { margin-top:22px; border-top:1px solid #cbd0d5; padding-top:10px; font-size:8pt; color:#5c6670; line-height:1.5; }
.section { break-inside:avoid; page-break-inside:avoid; }
tr { break-inside:avoid; page-break-inside:avoid; }
@media screen { body { padding:22px; } .report { padding:20px; box-shadow:0 2px 18px #00000012; } }
@media print { .report { max-width:none; } }
`;

// Informe de impresión separado de la página del administrador.
// De esta manera NO aparecen el menú, los botones ni las tarjetas de la aplicación.
function Imprimible({ r, alcance, productos }) {
  const hoy = new Date().toLocaleString('es-CL');
  const inventario = alcance === 'productos';
  return (
    <article className="report">
      <header className="top">
        <div className="brand">PERFUMES STORE</div>
        <div className="doc-type">Informe interno de gestión</div>
      </header>
      <h1>{inventario ? 'Informe de inventario' : 'Informe de ventas'}</h1>
      <div className="subtitle">{inventario ? 'Disponibilidad y valorización del catálogo' : 'Resumen comercial y desempeño mensual'}</div>
      <div className="meta">
        <div>Periodo<strong>{inventario ? 'Inventario actual' : formatoMes(r.periodo)}</strong></div>
        <div>Fecha de emisión<strong>{hoy}</strong></div>
        <div>Fuente<strong>Pedidos y productos registrados en el sistema</strong></div>
      </div>
      <div className="grid">
        {(inventario ? [
          ['Productos', productos.length],
          ['Valor estimado de stock', moneda(r.valorInventario)],
          ['Stock crítico', r.criticos],
          ['Categorías', Object.keys(r.inventarioPorCat).length],
        ] : [
          ['Ventas del periodo', moneda(r.totalMes)],
          ['Órdenes pagadas', r.pagadosMes.length],
          ['Ticket promedio', moneda(r.ticketMes)],
          ['Ingresos acumulados', moneda(r.totalHistorico)],
        ]).map(([label, value]) => <div className="kpi" key={label}><small>{label}</small><strong>{value}</strong></div>)}
      </div>
      {inventario ? (
        <>
          <section className="section">
            <h2>Stock disponible por categoría</h2>
            <table><thead><tr><th>Categoría</th><th>Unidades</th></tr></thead><tbody>
              {Object.entries(r.inventarioPorCat).sort((a,b) => b[1]-a[1]).map(([c,n]) => <tr key={c}><td>{c}</td><td>{n}</td></tr>)}
            </tbody></table>
          </section>
          <section className="section">
            <h2>Productos que requieren reposición</h2>
            <table><thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th></tr></thead><tbody>
              {r.detallesCriticos.length ? r.detallesCriticos.slice(0,15).map((p) => <tr key={p.id}><td>{p.marca} {p.modelo}</td><td>{p.tipo || 'Sin categoría'}</td><td>{p.stock}</td></tr>) : <tr><td colSpan={3}>No hay productos con stock crítico.</td></tr>}
            </tbody></table>
          </section>
        </>
      ) : (
        <>
          <section className="section">
            <h2>Evolución de ventas · últimos 6 meses</h2>
            <table><thead><tr><th>Mes</th><th className="right">Órdenes</th><th>Ventas pagadas</th></tr></thead><tbody>
              {r.evolucion.map((m) => <tr key={m.clave}><td style={{textTransform:'capitalize'}}>{formatoMes(m.clave)}</td><td className="right">{m.ordenes}</td><td>{moneda(m.monto)}</td></tr>)}
            </tbody></table>
          </section>
          <div className="columns">
            <section className="section"><h2>Ventas por categoría</h2>
              <table><thead><tr><th>Categoría</th><th>Monto</th></tr></thead><tbody>
                {r.ventasCategoria.length ? r.ventasCategoria.map(([c,v]) => <tr key={c}><td>{c}</td><td>{moneda(v)}</td></tr>) : <tr><td colSpan={2}>Sin ventas en el mes seleccionado.</td></tr>}
              </tbody></table>
            </section>
            <section className="section"><h2>Productos más vendidos</h2>
              <table><thead><tr><th>Producto</th><th>Unidades</th></tr></thead><tbody>
                {r.topProductos.length ? r.topProductos.map(([n,c]) => <tr key={n}><td>{n}</td><td>{c}</td></tr>) : <tr><td colSpan={2}>Sin ventas en el mes seleccionado.</td></tr>}
              </tbody></table>
            </section>
          </div>
          <section className="section"><h2>Últimas órdenes pagadas del periodo</h2>
            <table><thead><tr><th>Fecha</th><th>Código</th><th>Cliente</th><th>Total</th></tr></thead><tbody>
              {r.ultimas.length ? r.ultimas.map((p) => <tr key={p.id}><td>{formatoFecha(p.fecha)}</td><td>{p.codigo || `#${p.id}`}</td><td>{nombreCliente(p)}</td><td>{moneda(p.total)}</td></tr>) : <tr><td colSpan={4}>No hay órdenes pagadas para este periodo.</td></tr>}
            </tbody></table>
          </section>
        </>
      )}
      <footer className="note">
        Informe generado por Perfumes Store. Cifras en pesos chilenos (CLP).
        {inventario ? ' El valor de inventario se estima usando precios de venta por stock disponible; no representa costo contable.' : ' Las ventas incluyen únicamente pedidos con estado «pagado». Los resultados corresponden a los datos disponibles en la aplicación.'}
        Este informe es administrativo y no constituye un documento tributario.
      </footer>
    </article>
  );
}

export function AdminReportes({ productos = [], pedidos = [], alcance = 'general' }) {
  const [periodo, setPeriodo] = useState(() => mesClave(new Date()));
  const r = calcularReporte(productos, pedidos, periodo);
  const inventario = alcance === 'productos';
  const [errorImpresion, setErrorImpresion] = useState('');

  const imprimir = () => {
    // Se abre un documento A4 independiente, sin el menú ni el fondo de la tienda.
    const contenido = document.getElementById('perfumes-reporte-imprimir');
    if (!contenido) return;
    const ventana = window.open('', '_blank');
    if (!ventana) {
      setErrorImpresion('Tu navegador bloqueó la nueva ventana. Permite las ventanas emergentes para localhost:5173 e inténtalo nuevamente.');
      return;
    }
    setErrorImpresion('');
    ventana.document.open();
    ventana.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Informe Perfumes Store</title><style>${cssDocumento}</style></head><body>${contenido.innerHTML}</body></html>`);
    ventana.document.close();
    ventana.focus();
    // En navegadores modernos la impresión se prepara tras cargar el documento.
    let impresionIniciada = false;
    const mostrarImpresion = () => {
      if (impresionIniciada) return;
      impresionIniciada = true;
      ventana.focus();
      ventana.print();
    };
    ventana.addEventListener('load', mostrarImpresion, { once: true });
    if (ventana.document.readyState === 'complete') mostrarImpresion();
  };

  return (
    <div className="reporte-minimalista">
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-3">
        <div>
          <h1 className="h3 mb-1">{inventario ? 'Reportes de productos' : 'Reportes'}</h1>
          <div className="small text-muted">{inventario ? 'Inventario y disponibilidad actual' : 'Resumen de ventas y comportamiento comercial'}</div>
        </div>
        {!inventario && <div>
          <label className="form-label small text-muted mb-1" htmlFor="periodo-reporte">Mes de análisis</label>
          <input id="periodo-reporte" aria-label="Mes de análisis" type="month" className="form-control form-control-sm" value={periodo} onChange={(e) => e.target.value && setPeriodo(e.target.value)} />
        </div>}
      </div>

      {inventario ? (
        <>
          <div className="row g-3 mb-4">
            <Metrica titulo="Productos" valor={productos.length} descripcion="Productos del catálogo" />
            <Metrica titulo="Valor del inventario" valor={moneda(r.valorInventario)} descripcion="Estimado a precio de venta" />
            <Metrica titulo="Stock crítico" valor={r.criticos} descripcion="Productos que requieren atención" />
            <Metrica titulo="Categorías" valor={Object.keys(r.inventarioPorCat).length} descripcion="Categorías con productos" />
          </div>
          <div className="row g-3">
            <div className="col-lg-6"><Panel titulo="Stock por categoría">
              <ListaBarras datos={Object.entries(r.inventarioPorCat).sort((a,b) => b[1]-a[1])} formatear={(n) => `${n} u.`}/>
            </Panel></div>
            <div className="col-lg-6"><Panel titulo="Productos con stock crítico">
              {r.detallesCriticos.length ? <div className="table-responsive"><table className="table table-sm align-middle mb-0"><thead><tr><th>Producto</th><th className="text-end">Stock</th></tr></thead><tbody>
                {r.detallesCriticos.slice(0,8).map((p) => <tr key={p.id}><td>{p.marca} {p.modelo}</td><td className="text-end">{p.stock}</td></tr>)}
              </tbody></table></div> : <p className="small text-muted mb-0">No hay productos con stock crítico.</p>}
            </Panel></div>
          </div>
        </>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <Metrica titulo="Ventas del mes" valor={moneda(r.totalMes)} descripcion="Solo pedidos pagados" />
            <Metrica titulo="Órdenes pagadas" valor={r.pagadosMes.length} descripcion="En el mes seleccionado" />
            <Metrica titulo="Ticket promedio" valor={moneda(r.ticketMes)} descripcion="Por orden pagada" />
            <Metrica titulo="Ingresos acumulados" valor={moneda(r.totalHistorico)} descripcion="Histórico registrado" />
          </div>
          <div className="row g-3">
            <div className="col-lg-6"><Panel titulo="Ventas de los últimos 6 meses" subtitulo="Evolución de ingresos pagados">
              <ListaBarras datos={r.evolucion.map((m) => [m.etiqueta, m.monto])} formatear={moneda}/>
            </Panel></div>
            <div className="col-lg-6"><Panel titulo="Órdenes por estado" subtitulo="Mes seleccionado">
              <ListaBarras datos={r.estados.map((e) => [e.estado[0].toUpperCase() + e.estado.slice(1), e.n])} formatear={(n) => `${n} orden${n === 1 ? '' : 'es'}`} />
              <div className="small text-muted">Unidades vendidas este mes: <strong className="text-dark">{r.unidadesMes}</strong></div>
            </Panel></div>
            <div className="col-lg-6"><Panel titulo="Ventas por categoría" subtitulo="Distribución de ingresos del mes">
              <ListaBarras datos={r.ventasCategoria} formatear={moneda}/>
            </Panel></div>
            <div className="col-lg-6"><Panel titulo="Productos más vendidos" subtitulo="Unidades vendidas este mes">
              <ListaBarras datos={r.topProductos} formatear={(n) => `${n} u.`}/>
            </Panel></div>
          </div>
          <div className="card border-0 shadow-sm mt-3"><div className="card-body p-4">
            <h2 className="h6 fw-semibold mb-3">Últimas órdenes pagadas del mes</h2>
            <div className="table-responsive"><table className="table table-sm align-middle mb-0"><thead><tr><th>Fecha</th><th>Orden</th><th>Cliente</th><th className="text-end">Total</th></tr></thead><tbody>
              {r.ultimas.length ? r.ultimas.map((p) => <tr key={p.id}><td>{formatoFecha(p.fecha)}</td><td>{p.codigo || `#${p.id}`}</td><td>{nombreCliente(p)}</td><td className="text-end fw-semibold">{moneda(p.total)}</td></tr>) : <tr><td colSpan={4} className="text-muted py-3">No hay órdenes pagadas en el mes seleccionado.</td></tr>}
            </tbody></table></div>
          </div></div>
        </>
      )}
      <div className="d-flex align-items-center flex-wrap gap-3 mt-3">
        <button className="btn btn-outline-dark" onClick={imprimir}>Imprimir reporte / Guardar PDF</button>
        <span className="text-muted small">El archivo impreso incluye un diseño formal independiente.</span>
      </div>
      {errorImpresion && <div role="alert" className="alert alert-warning mt-3">{errorImpresion}</div>}
      <div id="perfumes-reporte-imprimir" style={{ display: 'none' }} aria-hidden="true">
        <Imprimible r={r} alcance={alcance} productos={productos} />
      </div>
    </div>
  );
}
