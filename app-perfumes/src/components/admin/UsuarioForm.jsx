import React, { useState } from 'react';
import { validarRut, validarCorreo } from '../../utils/validaciones';

const VACIO = { rut: '', nombre: '', apellido: '', correo: '', pass: '', rol: 'cliente', fechaNac: '', direccion: '' };

export const validarUsuario = (d, esNuevo) => {
  const e = {};
  const rut = d.rut.trim().toUpperCase();
  if (!rut || rut.length < 7 || rut.length > 9 || !validarRut(rut))
    e.rut = 'RUN inválido. Sin puntos ni guion (Ej: 19011022K).';
  if (!d.nombre.trim() || d.nombre.length > 50) e.nombre = 'Obligatorio, máximo 50 caracteres.';
  if (!d.apellido.trim() || d.apellido.length > 100) e.apellido = 'Obligatorio, máximo 100 caracteres.';
  if (!validarCorreo(d.correo.trim())) e.correo = 'Solo @duoc.cl, @profesor.duoc.cl o @gmail.com (máx. 100).';
  const pass = d.pass.trim();
  if ((esNuevo || pass) && (pass.length < 4 || pass.length > 10))
    e.pass = 'La contraseña debe tener entre 4 y 10 caracteres.';
  if (d.direccion.length > 300) e.direccion = 'Máximo 300 caracteres.';
  return e;
};

export function UsuarioForm({ inicial, errorExterno, onGuardar, onCancelar }) {
  const esNuevo = !inicial;
  // Al editar no se precarga la contraseña: en blanco = no cambiarla
  const [datos, setDatos] = useState(inicial ? { ...VACIO, ...inicial, pass: '' } : VACIO);
  const [errores, setErrores] = useState({});

  const cambiar = (e) => setDatos((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const enviar = (e) => {
    e.preventDefault();
    const err = validarUsuario(datos, esNuevo);
    setErrores(err);
    if (Object.keys(err).length) return;
    const limpio = {
      ...datos,
      rut: datos.rut.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      correo: datos.correo.trim(),
      direccion: datos.direccion.trim(),
    };
    if (!esNuevo && !datos.pass.trim()) delete limpio.pass;
    onGuardar(limpio);
  };

  const campo = (name, label, props = {}) => (
    <div className="col-md-6">
      <label htmlFor={`u-${name}`} className="form-label">{label}</label>
      <input
        id={`u-${name}`}
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
      {errorExterno && <div className="alert alert-danger py-2" role="alert">{errorExterno}</div>}
      <div className="row g-3">
        {campo('rut', 'RUN', { placeholder: '19011022K' })}
        {campo('correo', 'Correo', { type: 'email' })}
        {campo('nombre', 'Nombres')}
        {campo('apellido', 'Apellidos')}
        {campo('pass', esNuevo ? 'Contraseña' : 'Contraseña (vacío = no cambiar)', { type: 'password' })}
        <div className="col-md-6">
          <label htmlFor="u-rol" className="form-label">Rol</label>
          <select id="u-rol" name="rol" className="form-select" value={datos.rol} onChange={cambiar}>
            <option value="cliente">Cliente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        {campo('fechaNac', 'Fecha de nacimiento', { type: 'date' })}
        {campo('direccion', 'Dirección')}
      </div>
      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary">Guardar</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
