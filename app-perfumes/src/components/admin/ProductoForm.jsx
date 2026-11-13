import React, { useEffect, useState } from 'react';

const VACIO = {
  marca: '', modelo: '', tipo: '', genero: 'unisex', precio: '',
  descuento: '', stock: '', volumen: '', imagenes: '', descripcion: ''
};

const FORMATOS = ['image/jpeg', 'image/png', 'image/webp'];
const LIMITE_IMAGEN = 5 * 1024 * 1024; // 5 MB

export const validarProducto = (d, tieneImagenNueva = false) => {
  const e = {};
  if (!String(d.marca || '').trim()) e.marca = 'La marca es obligatoria.';
  if (!String(d.modelo || '').trim()) e.modelo = 'El modelo es obligatorio.';
  if (!d.tipo) e.tipo = 'Selecciona una categoría.';
  if (d.precio === '' || !Number.isInteger(Number(d.precio)) || Number(d.precio) <= 0)
    e.precio = 'El precio debe ser un entero mayor a 0.';
  if (d.descuento !== '' && d.descuento != null && (!Number.isInteger(Number(d.descuento)) || Number(d.descuento) < 0 || Number(d.descuento) > 90))
    e.descuento = 'El descuento debe ser un entero entre 0 y 90.';
  if (d.stock === '' || !Number.isInteger(Number(d.stock)) || Number(d.stock) < 0)
    e.stock = 'El stock debe ser un entero igual o mayor a 0.';
  if (!String(d.volumen || '').trim()) e.volumen = 'El volumen es obligatorio (ej. 100 ml).';
  if (!String(d.imagenes || '').trim() && !tieneImagenNueva)
    e.imagenes = 'Selecciona una imagen para el perfume.';
  if (!d.descripcion || d.descripcion.trim().length < 20)
    e.descripcion = 'Escribe una descripción de al menos 20 caracteres.';
  return e;
};

// En crear y editar se sube la foto al backend, que devuelve la URL para MySQL.
// En una edición sin nueva imagen se conserva la que ya tenía el producto.
export function ProductoForm({ inicial, categorias, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(() => inicial ? { ...VACIO, ...inicial } : { ...VACIO });
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!archivo) {
      setVistaPrevia('');
      return;
    }
    const urlTemporal = URL.createObjectURL(archivo);
    setVistaPrevia(urlTemporal);
    return () => URL.revokeObjectURL(urlTemporal);
  }, [archivo]);

  const cambiar = (e) => {
    setDatos((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrores((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const seleccionarImagen = (e) => {
    const elegido = e.target.files?.[0] || null;
    setErrorServidor('');
    setErrores((prev) => ({ ...prev, imagenes: '' }));
    if (!elegido) { setArchivo(null); return; }
    if (!FORMATOS.includes(elegido.type)) {
      setErrores((prev) => ({ ...prev, imagenes: 'Usa JPG, PNG o WebP.' }));
      setArchivo(null);
      e.target.value = '';
      return;
    }
    if (elegido.size > LIMITE_IMAGEN) {
      setErrores((prev) => ({ ...prev, imagenes: 'La imagen debe pesar máximo 5 MB.' }));
      setArchivo(null);
      e.target.value = '';
      return;
    }
    setArchivo(elegido);
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (guardando) return;
    const err = validarProducto(datos, Boolean(archivo));
    setErrores(err);
    setErrorServidor('');
    if (Object.keys(err).length > 0) return;

    setGuardando(true);
    try {
      let imagenes = datos.imagenes;
      if (archivo) {
        const formulario = new FormData();
        formulario.append('archivo', archivo);
        const respuesta = await fetch('/api/productos/imagen', {
          method: 'POST',
          credentials: 'same-origin',
          body: formulario
          // No escribir Content-Type: el navegador configura multipart/form-data.
        });
        const resultado = await respuesta.json().catch(() => null);
        if (!respuesta.ok || !resultado?.url) {
          throw new Error(resultado?.error || `No se pudo subir la foto (HTTP ${respuesta.status}).`);
        }
        imagenes = resultado.url;
      }
      await onGuardar({ ...datos, imagenes });
    } catch (error) {
      setErrorServidor('No se pudo guardar la imagen o el producto: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const campo = (name, label, props = {}) => (
    <div className="col-md-6">
      <label htmlFor={name} className="form-label">{label}</label>
      <input
        id={name} name={name}
        className={`form-control ${errores[name] ? 'is-invalid' : ''}`}
        value={datos[name] ?? ''} onChange={cambiar} {...props}
      />
      {errores[name] && <div className="invalid-feedback">{errores[name]}</div>}
    </div>
  );

  const imagenActual = vistaPrevia || datos.imagenes;

  return (
    <form onSubmit={enviar} noValidate className="card border-0 shadow-sm p-4">
      {errorServidor && <div className="alert alert-danger" role="alert">{errorServidor}</div>}
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
        {campo('descuento', 'Descuento % (0 = sin oferta)', { type: 'number', min: 0, max: 90 })}
        {campo('stock', 'Stock', { type: 'number', min: 0 })}
        {campo('volumen', 'Volumen', { placeholder: '100 ml' })}

        <div className="col-12">
          <label htmlFor="imagenes" className="form-label fw-semibold">Fotografía del producto</label>
          <input
            id="imagenes" name="imagenes" type="file" accept="image/jpeg,image/png,image/webp"
            className={`form-control ${errores.imagenes ? 'is-invalid' : ''}`}
            onChange={seleccionarImagen} disabled={guardando}
          />
          <div className="form-text">
            JPG, PNG o WebP · máximo 5 MB.
            {inicial?.imagenes ? ' Si no seleccionas otra fotografía, se conserva la actual.' : ' Selecciona una imagen de tu computador.'}
          </div>
          {errores.imagenes && <div className="invalid-feedback d-block">{errores.imagenes}</div>}
          {imagenActual && (
            <div className="mt-3 border rounded bg-light d-inline-flex flex-column align-items-center p-3" style={{ minWidth: 160 }}>
              <img src={imagenActual} alt="Vista previa del perfume" width="140" height="140" style={{ objectFit: 'contain' }} />
              <small className="text-muted mt-2">{archivo ? 'Nueva fotografía' : 'Imagen actual'}</small>
            </div>
          )}
        </div>

        <div className="col-12">
          <label htmlFor="descripcion" className="form-label">Descripción</label>
          <textarea id="descripcion" name="descripcion" rows="3"
            className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`}
            placeholder="Familia olfativa, notas principales y ocasión de uso"
            value={datos.descripcion || ''} onChange={cambiar}
          />
          {errores.descripcion && <div className="invalid-feedback d-block">{errores.descripcion}</div>}
        </div>
      </div>
      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {guardando ? 'Guardando producto...' : 'Guardar'}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar} disabled={guardando}>Cancelar</button>
      </div>
    </form>
  );
}
