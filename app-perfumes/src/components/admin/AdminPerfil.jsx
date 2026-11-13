import React, { useEffect, useState } from 'react';

export function AdminPerfil({ usuario, onGuardar }) {
  const [nombre, setNombre] = useState(usuario.nombre || '');
  const [apellido, setApellido] = useState(usuario.apellido || '');
  const [pass, setPass] = useState('');
  const [errores, setErrores] = useState({});
  const [ok, setOk] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Leer los datos reales del administrador desde MySQL al abrir Perfil.
  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const respuesta = await fetch('/api/admin/perfil', { credentials: 'same-origin' });
        const perfil = await respuesta.json().catch(() => null);
        if (!respuesta.ok) throw new Error(perfil?.error || `Error HTTP ${respuesta.status}`);
        if (activo) {
          setNombre(perfil.nombre || '');
          setApellido(perfil.apellido || '');
        }
      } catch (error) {
        if (activo) setErrorServidor('No se pudo consultar el perfil: ' + error.message);
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargar();
    return () => { activo = false; };
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    if (cargando || guardando) return;
    const err = {};
    if (!nombre.trim() || nombre.trim().length > 50) err.nombre = 'Obligatorio, máximo 50 caracteres.';
    if (!apellido.trim() || apellido.trim().length > 100) err.apellido = 'Obligatorio, máximo 100 caracteres.';
    if (pass && (pass.length < 4 || pass.length > 10)) err.pass = 'Debe tener entre 4 y 10 caracteres.';
    setErrores(err);
    setOk(false);
    setErrorServidor('');
    if (Object.keys(err).length) return;

    setGuardando(true);
    try {
      await onGuardar({ nombre: nombre.trim(), apellido: apellido.trim(), ...(pass ? { pass } : {}) });
      setPass('');
      setOk(true);
    } catch (error) {
      setErrorServidor('No se pudieron guardar los cambios: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <h1 className="h3">Perfil</h1>
      <form onSubmit={enviar} noValidate className="card border-0 shadow-sm p-4" style={{ maxWidth: 520 }}>
        {cargando && <div className="alert alert-info py-2">Cargando perfil desde MySQL...</div>}
        {errorServidor && <div className="alert alert-danger py-2" role="alert">{errorServidor}</div>}
        {ok && <div className="alert alert-success py-2" role="status">Perfil actualizado en MySQL.</div>}
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
        <button className="btn btn-primary align-self-start" type="submit" disabled={cargando || guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </>
  );
}
