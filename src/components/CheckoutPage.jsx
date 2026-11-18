import React, { useState, useEffect } from 'react';
import { TablaResumen } from './TablaResumen';
import { DatosEnvio } from './DatosEnvio';
import { clp } from '../utils/formato';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validar = (d) => {
  const errores = {};
  const nombre = d.nombre.trim();
  const apellido = d.apellido.trim();
  const correo = d.correo.trim();
  const calle = d.calle.trim();

  if (!nombre || nombre.length > 50) errores.nombre = 'Obligatorio, máximo 50 caracteres.';
  if (!apellido || apellido.length > 100) errores.apellido = 'Obligatorio, máximo 100 caracteres.';
  if (!correo) errores.correo = 'El correo es obligatorio.';
  else if (correo.length > 100 || !EMAIL_REGEX.test(correo)) errores.correo = 'Ingresa un correo válido (máx. 100 caracteres).';
  if (!calle || calle.length > 300) errores.calle = 'La calle es obligatoria (máx. 300 caracteres).';
  if (d.departamento.trim().length > 20) errores.departamento = 'Máximo 20 caracteres.';
  if (!d.region) errores.region = 'Debes seleccionar una región.';
  if (!d.comuna) errores.comuna = 'Debes seleccionar una comuna.';
  if (d.indicaciones.trim().length > 300) errores.indicaciones = 'Máximo 300 caracteres.';
  return errores;
};

export const CheckoutPage = ({ carrito, usuarioActual, procesando, onPagar, onVolver }) => {
  // Si el usuario inició sesión, sus datos se cargan automáticamente
  const [datos, setDatos] = useState(() => ({
    nombre: usuarioActual?.nombre || '',
    apellido: usuarioActual?.apellido || '',
    correo: usuarioActual?.correo || '',
    calle: usuarioActual?.direccion || '',
    departamento: '',
    region: usuarioActual?.region || '',
    comuna: usuarioActual?.comuna || '',
    indicaciones: '',
  }));
  const [errores, setErrores] = useState({});
  const [regiones, setRegiones] = useState([]);

  useEffect(() => {
    fetch('/data/comunas-regiones.json')
      .then((res) => res.json())
      .then((data) => setRegiones(Array.isArray(data) ? data : data.regiones || []))
      .catch((err) => console.error('Error cargando regiones y comunas:', err));
  }, []);

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const handleChange = (campo, valor) => {
    setDatos((prev) => ({
      ...prev,
      [campo]: valor,
      ...(campo === 'region' ? { comuna: '' } : {}), // al cambiar de región se reinicia la comuna
    }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (procesando) return;

    const nuevosErrores = validar(datos);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    onPagar({
      cliente: {
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        correo: datos.correo.trim(),
      },
      envio: {
        calle: datos.calle.trim(),
        departamento: datos.departamento.trim(),
        region: datos.region,
        comuna: datos.comuna,
        indicaciones: datos.indicaciones.trim(),
      },
    });
  };

  if (carrito.length === 0) {
    return (
      <main className="container my-5 flex-grow-1 text-center">
        <p className="text-muted fs-5">No tienes productos en el carrito.</p>
        <button className="btn btn-dark" onClick={onVolver}>Volver al carrito</button>
      </main>
    );
  }

  return (
    <main className="container my-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-xl-8">
          <form className="card border-0 shadow-sm p-4" onSubmit={handleSubmit} noValidate>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <h2 className="h4 fw-bold mb-1">Carrito de compra</h2>
                <p className="text-muted small mb-0">Completa la siguiente información</p>
              </div>
              <div className="bg-primary text-white rounded px-3 py-2 fw-semibold">
                Total a pagar: {clp(total)}
              </div>
            </div>

            <TablaResumen items={carrito} />

            <DatosEnvio
              datos={datos}
              errores={errores}
              onChange={handleChange}
              regiones={regiones}
            />

            <div className="d-flex justify-content-between flex-wrap gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onVolver}
                disabled={procesando}
              >
                ← Volver al carrito
              </button>
              <button type="submit" className="btn btn-success fw-semibold px-4" disabled={procesando}>
                {procesando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    Procesando pago...
                  </>
                ) : (
                  `Pagar ahora ${clp(total)}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
