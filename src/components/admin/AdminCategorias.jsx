import React, { useState } from 'react';

// CRUD de categorías con formulario en la misma vista (nueva / editar)
export function AdminCategorias({ categorias, productos, onCrear, onActualizar, onEliminar }) {
  const [editando, setEditando] = useState(null); // null = nueva
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  const limpiar = () => { setEditando(null); setNombre(''); setDescripcion(''); setError(''); };

  const editar = (c) => { setEditando(c); setNombre(c.nombre); setDescripcion(c.descripcion || ''); setError(''); };

  const enviar = (e) => {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) return setError('El nombre es obligatorio.');
    if (categorias.some((c) => c.nombre.toLowerCase() === n.toLowerCase() && c.id !== editando?.id))
      return setError('Ya existe una categoría con ese nombre.');
    if (editando) onActualizar(editando, { nombre: n, descripcion: descripcion.trim() });
    else onCrear({ nombre: n, descripcion });
    limpiar();
  };

  const cantidad = (c) => productos.filter((p) => p.tipo === c.nombre).length;

  return (
    <>
      <h1 className="h3">Categorías</h1>
      <div className="row g-4">
        <div className="col-lg-4">
          <form onSubmit={enviar} noValidate className="card border-0 shadow-sm p-3">
            <h2 className="h6">{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
            <label htmlFor="catNombre" className="form-label">Nombre</label>
            <input id="catNombre" className={`form-control mb-2 ${error ? 'is-invalid' : ''}`} value={nombre} onChange={(e) => setNombre(e.target.value)} />
            {error && <div className="invalid-feedback d-block mb-2">{error}</div>}
            <label htmlFor="catDesc" className="form-label">Descripción</label>
            <textarea id="catDesc" rows="2" className="form-control mb-3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            <div className="d-flex gap-2">
              <button className="btn btn-primary" type="submit">{editando ? 'Guardar cambios' : 'Crear'}</button>
              {editando && <button className="btn btn-outline-secondary" type="button" onClick={limpiar}>Cancelar</button>}
            </div>
          </form>
        </div>
        <div className="col-lg-8">
          <div className="table-responsive bg-white rounded shadow-sm">
            <table className="table align-middle mb-0">
              <thead><tr><th>Nombre</th><th>Descripción</th><th className="text-center">Productos</th><th></th></tr></thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id}>
                    <td className="text-capitalize fw-semibold">{c.nombre}</td>
                    <td className="text-muted small">{c.descripcion}</td>
                    <td className="text-center">{cantidad(c)}</td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editar(c)}>Editar</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(c, cantidad(c))}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
