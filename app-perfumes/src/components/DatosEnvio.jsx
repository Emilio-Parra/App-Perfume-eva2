import React from 'react';

const Campo = ({ id, etiqueta, requerido, error, col = 'col-md-6', children }) => (
  <div className={col}>
    <label htmlFor={`envio-${id}`} className="form-label small fw-semibold mb-1">
      {etiqueta}
      {requerido && <span className="text-danger">*</span>}
    </label>
    {children}
    {error && <div className="invalid-feedback d-block">{error}</div>}
  </div>
);

// Datos del cliente + dirección de entrega.
// Editable en el checkout y en modo solo lectura (readOnly) en las vistas de resultado.
export const DatosEnvio = ({ datos, errores = {}, onChange, regiones = [], readOnly = false }) => {
  const comunas = regiones.find((r) => r.region === datos.region)?.comunas || [];

  const entrada = (id, extra = {}) => (
    <input
      id={`envio-${id}`}
      className={`form-control ${errores[id] ? 'is-invalid' : ''}`}
      value={datos[id]}
      onChange={(e) => onChange(id, e.target.value)}
      readOnly={readOnly}
      {...extra}
    />
  );

  // En solo lectura no hace falta cargar la lista: el select muestra el valor guardado
  const selector = (id, opciones, placeholder) => (
    <select
      id={`envio-${id}`}
      className={`form-select ${errores[id] ? 'is-invalid' : ''}`}
      value={datos[id]}
      onChange={(e) => onChange(id, e.target.value)}
      disabled={readOnly}
    >
      {readOnly ? (
        <option value={datos[id]}>{datos[id]}</option>
      ) : (
        <>
          <option value="">{placeholder}</option>
          {opciones.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </>
      )}
    </select>
  );

  return (
    <>
      {!readOnly && (
        <>
          <h5 className="fw-bold mt-4 mb-1">Información del cliente</h5>
          <p className="text-muted small mb-3">Completa la siguiente información</p>
        </>
      )}
      <div className="row g-3">
        <Campo id="nombre" etiqueta="Nombre" requerido error={errores.nombre} col="col-md-4">
          {entrada('nombre', { maxLength: 50 })}
        </Campo>
        <Campo id="apellido" etiqueta="Apellidos" requerido error={errores.apellido} col="col-md-4">
          {entrada('apellido', { maxLength: 100 })}
        </Campo>
        <Campo id="correo" etiqueta="Correo" requerido error={errores.correo} col="col-md-4">
          {entrada('correo', { type: 'email', maxLength: 100 })}
        </Campo>
      </div>

      <h5 className="fw-bold mt-4 mb-1">Dirección de entrega de los productos</h5>
      {!readOnly && <p className="text-muted small mb-3">Ingrese dirección de forma detallada</p>}
      <div className="row g-3">
        <Campo id="calle" etiqueta="Calle" requerido error={errores.calle}>
          {entrada('calle', { maxLength: 300 })}
        </Campo>
        <Campo id="departamento" etiqueta="Departamento (opcional)" error={errores.departamento}>
          {entrada('departamento', { maxLength: 20, placeholder: 'Ej: 603' })}
        </Campo>
        <Campo id="region" etiqueta="Región" requerido error={errores.region}>
          {selector('region', regiones.map((r) => r.region), 'Selecciona una región')}
        </Campo>
        <Campo id="comuna" etiqueta="Comuna" requerido error={errores.comuna}>
          {selector('comuna', comunas, datos.region ? 'Selecciona una comuna' : 'Primero elige una región')}
        </Campo>
        <Campo id="indicaciones" etiqueta="Indicaciones para la entrega (opcional)" error={errores.indicaciones} col="col-12">
          <textarea
            id="envio-indicaciones"
            className={`form-control ${errores.indicaciones ? 'is-invalid' : ''}`}
            rows="3"
            maxLength={300}
            placeholder="Ej: Entre calles, color del edificio, no tiene timbre."
            value={datos.indicaciones}
            onChange={(e) => onChange('indicaciones', e.target.value)}
            readOnly={readOnly}
          />
        </Campo>
      </div>
    </>
  );
};
