import React, { useState } from 'react';

export function AdminPerfil({ usuario, onGuardar }) {
  const [nombre, setNombre] = useState(usuario.nombre || '');
  const [apellido, setApellido] = useState(usuario.apellido || '');
  const [pass, setPass] = useState('');
  const [errores, setErrores] = useState({});
  const [ok, setOk] = useState(false);

  const enviar = (e) => {
    e.preventDefault();
    const err = {};
    if (!nombre.trim() || nombre.length > 50) err.nombre = 'Obligatorio, máximo 50 caracteres.';
    if (!apellido.trim() || apellido.length > 100) err.apellido = 'Obligatorio, máximo 100 caracteres.';
    if (pass && (pass.length < 4 || pass.length > 10)) err.pass = 'Debe tener entre 4 y 10 caracteres.';
    setErrores(err);
    setOk(false);
    if (Object.keys(err).length) return;
    onGuardar({ nombre: nombre.trim(), apellido: apellido.trim(), ...(pass ? { pass } : {}) });
    setPass('');
    setOk(true);
  };

  return (
    <>
      <h1 className="h3">Perfil</h1>
      <form onSubmit={enviar} noValidate className="card border-0 shadow-sm p-4" style={{ maxWidth: 520 }}>
        {ok && <div className="alert alert-success py-2" role="status">Perfil actualizado.</div>}
        <div className="mb-3"><label className="form-label">Correo</label><input className="form-control" value={usuario.correo} readOnly /></div>
        <div className="mb-3">
          <label htmlFor="pf-nombre" className="form-label">Nombres</label>
          <input id="pf-nombre" className={`form-control ${errores.nombre ? 'is-invalid' : ''}`} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="pf-apellido" className="form-label">Apellidos</label>
          <input id="pf-apellido" className={`form-control ${errores.apellido ? 'is-invalid' : ''}`} value={apellido} onChange={(e) => setApellido(e.target.value)} />
          {errores.apellido && <div className="invalid-feedback">{errores.apellido}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="pf-pass" className="form-label">Nueva contraseña (vacío = no cambiar)</label>
          <input id="pf-pass" type="password" className={`form-control ${errores.pass ? 'is-invalid' : ''}`} value={pass} onChange={(e) => setPass(e.target.value)} />
          {errores.pass && <div className="invalid-feedback">{errores.pass}</div>}
        </div>
        <button className="btn btn-primary align-self-start" type="submit">Guardar cambios</button>
      </form>
    </>
  );
}
