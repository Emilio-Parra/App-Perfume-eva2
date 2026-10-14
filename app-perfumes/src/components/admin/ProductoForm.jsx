import React, { useState } from 'react';

const VACIO = { marca: '', modelo: '', tipo: '', genero: 'unisex', precio: '', stock: '', volumen: '', imagenes: '', descripcion: '' };

export const validarProducto = (d) => {
  const e = {};
  if (!d.marca.trim()) e.marca = 'La marca es obligatoria.';
  if (!d.modelo.trim()) e.modelo = 'El modelo es obligatorio.';
  if (!d.tipo) e.tipo = 'Selecciona una categoría.';
  if (d.precio === '' || !Number.isInteger(Number(d.precio)) || Number(d.precio) <= 0)
    e.precio = 'El precio debe ser un entero mayor a 0.';
  if (d.stock === '' || !Number.isInteger(Number(d.stock)) || Number(d.stock) < 0)
    e.stock = 'El stock debe ser un entero igual o mayor a 0.';
  if (!d.volumen.trim()) e.volumen = 'El volumen es obligatorio (ej. 100 ml).';
  if (!d.imagenes.trim()) e.imagenes = 'Indica la ruta o URL de la imagen.';
  if (!d.descripcion || d.descripcion.trim().length < 20)
    e.descripcion = 'Escribe una descripción de al menos 20 caracteres.';
  return e;
};

// Formulario reutilizable para crear y editar productos
export function ProductoForm({ inicial, categorias, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(inicial ? { ...VACIO, ...inicial } : VACIO);
  const [errores, setErrores] = useState({});

  const cambiar = (e) => setDatos((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const enviar = (e) => {
    e.preventDefault();
    const err = validarProducto(datos);
    setErrores(err);
    if (Object.keys(err).length === 0) onGuardar(datos);
  };

  const campo = (name, label, props = {}) => (
    <div className="col-md-6">
      <label htmlFor={name} className="form-label">{label}</label>
      <input
        id={name}
        name={name}
        className={`form-control ${errores[name] ? 'is-invalid' : ''}`}
        value={datos[name]}
        onChange={cambiar}
        {...props}
      />
      {errores[name] && <div className="invalid-feedback">{errores[name]}</div>}
    </div>
  );

  return (
    <form onSubmit={enviar} noValidate className="card border-0 shadow-sm p-4">
      <div className="row g-3">
        {campo('marca', 'Marca')}
        {campo('modelo', 'Modelo')}
        <div className="col-md-6">
          <label htmlFor="tipo" className="form-label">Categoría</label>
          <select id="tipo" name="tipo" className={`form-select ${errores.tipo ? 'is-invalid' : ''}`} value={datos.tipo} onChange={cambiar}>
            <option value="">Selecciona...</option>
            {categorias.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
          </select>
          {errores.tipo && <div className="invalid-feedback">{errores.tipo}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="genero" className="form-label">Género</label>
          <select id="genero" name="genero" className="form-select" value={datos.genero} onChange={cambiar}>
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
        {campo('precio', 'Precio (CLP)', { type: 'number', min: 1 })}
        {campo('stock', 'Stock', { type: 'number', min: 0 })}
        {campo('volumen', 'Volumen', { placeholder: '100 ml' })}
        {campo('imagenes', 'Imagen (ruta o URL)', { placeholder: '/img/arabe/images.jpg' })}

        <div className="col-12">
          <label htmlFor="descripcion" className="form-label">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows="3"
            className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`}
            placeholder="Familia olfativa, notas principales y ocasión de uso"
            value={datos.descripcion || ''}
            onChange={cambiar}
          />
          {errores.descripcion && <div className="invalid-feedback">{errores.descripcion}</div>}
        </div>

        {datos.imagenes && (
          <div className="col-12">
            <img src={datos.imagenes} alt="Vista previa" height="80" style={{ objectFit: 'contain' }} onError={(e) => (e.target.style.display = 'none')} />
          </div>
        )}
      </div>
      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary">Guardar</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
