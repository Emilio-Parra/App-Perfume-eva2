import React, { useState } from 'react';
import { ProductoForm } from './ProductoForm';
import { esCritico, STOCK_CRITICO } from '../../service/productosService';
import { clp } from '../../utils/formato';

const Encabezado = ({ titulo, vista, onIr }) => (
  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
    <h1 className="h3 mb-0">{titulo}</h1>
    <div className="btn-group">
      <button className={`btn btn-sm ${vista === 'productos' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => onIr('productos')}>Listado</button>
      <button className={`btn btn-sm ${vista === 'producto-criticos' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => onIr('producto-criticos')}>Críticos</button>
      <button className={`btn btn-sm ${vista === 'producto-reportes' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => onIr('producto-reportes')}>Reportes</button>
      <button className="btn btn-sm btn-primary" onClick={() => onIr('producto-nuevo')}>+ Nuevo producto</button>
    </div>
  </div>
);

const StockBadge = ({ p }) => (
  <span className={`badge text-bg-${esCritico(p) ? 'danger' : 'success'}`}>{p.stock}</span>
);

function TablaProductos({ productos, onEditar, onEliminar }) {
  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr><th></th><th>Producto</th><th>Categoría</th><th>Género</th><th className="text-end">Precio</th><th className="text-center">Stock</th><th></th></tr>
        </thead>
        <tbody>
          {productos.length === 0 && (
            <tr><td colSpan="7" className="text-center text-muted py-4">No hay productos que mostrar.</td></tr>
          )}
          {productos.map((p) => (
            <tr key={p.id}>
              <td><img src={p.imagenes} alt={p.modelo} width="40" height="40" style={{ objectFit: 'contain' }} /></td>
              <td><strong>{p.marca}</strong> {p.modelo}<div className="small text-muted">{p.volumen}</div></td>
              <td className="text-capitalize">{p.tipo}</td>
              <td className="text-capitalize">{p.genero}</td>
              <td className="text-end">{clp(p.precio)}{Number(p.descuento) > 0 && <span className="badge bg-danger ms-1">-{p.descuento}%</span>}</td>
              <td className="text-center"><StockBadge p={p} /></td>
              <td className="text-end text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => onEditar(p.id)}>Editar</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(p)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Listado + buscador + filtro de categoría
export function AdminProductos({ productos, categorias, vista, onIr, onEditar, onEliminar }) {
  const [texto, setTexto] = useState('');
  const [cat, setCat] = useState('todas');
  const q = texto.trim().toLowerCase();

  const filtrados = productos
    .filter((p) => cat === 'todas' || p.tipo === cat)
    .filter((p) => !q || `${p.marca} ${p.modelo}`.toLowerCase().includes(q));

  return (
    <>
      <Encabezado titulo="Productos" vista={vista} onIr={onIr} />
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input className="form-control" placeholder="Buscar por marca o modelo" aria-label="Buscar productos" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" aria-label="Filtrar por categoría" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
          </select>
        </div>
      </div>
      <TablaProductos productos={filtrados} onEditar={onEditar} onEliminar={onEliminar} />
    </>
  );
}

export function AdminProductosCriticos({ productos, vista, onIr, onEditar, onEliminar }) {
  const criticos = [...productos].filter(esCritico).sort((a, b) => a.stock - b.stock);
  return (
    <>
      <Encabezado titulo="Productos críticos" vista={vista} onIr={onIr} />
      <p className="text-muted">Productos con stock de {STOCK_CRITICO} unidades o menos ({criticos.length}).</p>
      <TablaProductos productos={criticos} onEditar={onEditar} onEliminar={onEliminar} />
    </>
  );
}

export function AdminProductoFormulario({ producto, categorias, onGuardar, onCancelar }) {
  return (
    <>
      <h1 className="h3 mb-3">{producto ? `Editar producto #${producto.id}` : 'Nuevo producto'}</h1>
      <ProductoForm inicial={producto} categorias={categorias} onGuardar={onGuardar} onCancelar={onCancelar} />
    </>
  );
}
