import React, { useState } from 'react';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    mensaje: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [mensajeExito, setMensajeExito] = useState(false);

  const MAX_CARACTERES = 250;
  const caracteresRestantes = MAX_CARACTERES - formData.mensaje.length;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    let esValido = true;

    setMensajeExito(false);

    if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'Por favor, ingresa tu nombre (mínimo 2 caracteres).';
      esValido = false;
    }

    if (formData.apellido.trim().length < 2) {
      newErrors.apellido = 'Por favor, ingresa tu apellido.';
      esValido = false;
    }

    const regexTel = /^[+]?[\d\s-]{8,15}$/;
    if (formData.telefono.trim() !== '' && !regexTel.test(formData.telefono.trim())) {
      newErrors.telefono = 'Formato de teléfono inválido (ej. +56912345678).';
      esValido = false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(formData.email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido (ej. usuario@dominio.com).';
      esValido = false;
    }

    const largoMensaje = formData.mensaje.trim().length;
    if (largoMensaje < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
      esValido = false;
    } else if (largoMensaje > MAX_CARACTERES) {
      newErrors.mensaje = 'El mensaje excede los 250 caracteres permitidos.';
      esValido = false;
    }

    setErrors(newErrors);
    setTouched({ nombre: true, apellido: true, telefono: true, email: true, mensaje: true });

    if (esValido) {
      setMensajeExito(true);
      setFormData({ nombre: '', apellido: '', telefono: '', email: '', mensaje: '' });
      setErrors({});
      setTouched({});
    }
  };

  const getClass = (field) => {
    if (!touched[field]) return 'form-control';
    return errors[field] ? 'form-control is-invalid' : 'form-control is-valid';
  };

  return (
    <main className="container my-5" style={{ maxWidth: '600px' }}>
      <h1 className="text-center mb-4 fw-bold">Contáctanos</h1>

      {mensajeExito && (
        <div className="alert alert-success mb-4" role="alert">
          ¡Gracias por contactarnos! Tu mensaje ha sido enviado con éxito.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input
            type="text"
            className={getClass('nombre')}
            id="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
          {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="apellido" className="form-label">Apellido</label>
          <input
            type="text"
            className={getClass('apellido')}
            id="apellido"
            value={formData.apellido}
            onChange={handleChange}
          />
          {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="telefono" className="form-label">Teléfono</label>
          <input
            type="tel"
            className={getClass('telefono')}
            id="telefono"
            placeholder="+56912345678"
            value={formData.telefono}
            onChange={handleChange}
          />
          {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input
            type="email"
            className={getClass('email')}
            id="email"
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="mensaje" className="form-label">Mensaje</label>
          <textarea
            className={getClass('mensaje')}
            id="mensaje"
            rows={4}
            value={formData.mensaje}
            onChange={handleChange}
          ></textarea>
          {errors.mensaje && <div className="invalid-feedback">{errors.mensaje}</div>}
          <div className={`form-text text-end ${caracteresRestantes < 0 ? 'text-danger' : ''}`}>
            Caracteres restantes: {caracteresRestantes}
          </div>
        </div>

        <button type="submit" className="btn btn-dark w-100">
          Enviar Mensaje
        </button>
      </form>
    </main>
  );
}