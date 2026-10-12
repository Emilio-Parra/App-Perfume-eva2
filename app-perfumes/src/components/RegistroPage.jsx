import React, { useState, useEffect } from 'react';

export function RegistroPage({ onIrALogin }) {
  const [datosUbicacion, setDatosUbicacion] = useState([]);
  const [formData, setFormData] = useState({
    rut: '',
    correo: '',
    nombre: '',
    apellido: '',
    pass: '',
    passConf: '',
    fechaNac: '',
    region: '',
    comuna: '',
    direccion: ''
  });

  const [errors, setErrors] = useState({});
  const [mensajeExito, setMensajeExito] = useState(false);

  // Cargar regiones y comunas desde la carpeta public
  useEffect(() => {
    fetch('/data/comunas-regiones.json')
      .then((res) => res.json())
      .then((data) => {
        const arreglo = Array.isArray(data) ? data : (data.regiones || []);
        setDatosUbicacion(arreglo);
      })
      .catch((err) => console.error('Error cargando el archivo de regiones:', err));
  }, []);

  // Algoritmo Módulo 11 para validar RUN
  const validarRutChileno = (rutCompleto) => {
    if (!/^[0-9]+[0-9kK]$/.test(rutCompleto)) return false;
    let cuerpo = rutCompleto.slice(0, -1);
    let dv = rutCompleto.slice(-1).toUpperCase();
    let suma = 0;
    let multiplo = 2;
    for (let i = 1; i <= cuerpo.length; i++) {
      let index = multiplo * rutCompleto.charAt(cuerpo.length - i);
      suma = suma + index;
      if (multiplo < 7) { multiplo = multiplo + 1; } else { multiplo = 2; }
    }
    let dvEsperado = 11 - (suma % 11);
    dvEsperado = (dvEsperado === 11) ? 0 : (dvEsperado === 10) ? "K" : dvEsperado;
    return dv.toString() === dvEsperado.toString();
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
      ...(id === 'region' ? { comuna: '' } : {})
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    setMensajeExito(false);

    // 1. Validar RUN
    const rutVal = formData.rut.trim().toUpperCase();
    if (!rutVal) {
      newErrors.rut = 'El RUN es obligatorio.';
    } else if (rutVal.length < 7 || rutVal.length > 9 || !validarRutChileno(rutVal)) {
      newErrors.rut = 'El RUN no es válido. Escríbelo sin puntos ni guion (Ej: 19011022K).';
    }

    // 2. Validar Nombres
    const nombreVal = formData.nombre.trim();
    if (!nombreVal || nombreVal.length > 50) {
      newErrors.nombre = 'Obligatorio, máximo 50 caracteres.';
    }

    // 3. Validar Apellidos
    const apellidoVal = formData.apellido.trim();
    if (!apellidoVal || apellidoVal.length > 100) {
      newErrors.apellido = 'Obligatorio, máximo 100 caracteres.';
    }

    // 4. Validar Correo
    const emailVal = formData.correo.trim();
    const dominiosPermitidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    const esDominioValido = dominiosPermitidos.some(d => emailVal.endsWith(d));
    if (!emailVal || emailVal.length > 100 || !esDominioValido) {
      newErrors.correo = 'Obligatorio, máx 100 caracteres. Solo @duoc.cl, @profesor.duoc.cl o @gmail.com.';
    }

    // 5. Validar Contraseña
    const passVal = formData.pass.trim();
    if (passVal.length < 4 || passVal.length > 10) {
      newErrors.pass = 'La contraseña debe tener entre 4 y 10 caracteres.';
    }

    // 6. Validar Confirmar Contraseña
    if (formData.passConf.trim() !== passVal || !formData.passConf.trim()) {
      newErrors.passConf = 'Las contraseñas no coinciden.';
    }

    // 7. Validar Región y Comuna
    if (!formData.region) newErrors.region = 'Debes seleccionar una región.';
    if (!formData.comuna) newErrors.comuna = 'Debes seleccionar una comuna.';

    // 8. Validar Dirección
    const direccionVal = formData.direccion.trim();
    if (!direccionVal || direccionVal.length > 300) {
      newErrors.direccion = 'La dirección es obligatoria y de máximo 300 caracteres.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios_perfumes') || '[]');
      
      const existeUsuario = usuariosExistentes.some(u => u.correo === emailVal || u.rut === rutVal);
      if (existeUsuario) {
        setErrors({ correo: 'Este correo o RUN ya está registrado.' });
        return;
      }

      const nuevoUsuario = {
        rut: rutVal,
        correo: emailVal,
        nombre: nombreVal,
        apellido: apellidoVal,
        pass: passVal,
        rol: 'cliente',
        fechaNac: formData.fechaNac,
        region: formData.region,
        comuna: formData.comuna,
        direccion: direccionVal
      };

      localStorage.setItem('usuarios_perfumes', JSON.stringify([...usuariosExistentes, nuevoUsuario]));

      setMensajeExito(true);
      setFormData({
        rut: '', correo: '', nombre: '', apellido: '', pass: '', passConf: '', fechaNac: '', region: '', comuna: '', direccion: ''
      });

      setTimeout(() => {
        if (onIrALogin) onIrALogin();
      }, 2000);
    }
  };

  // Obtener datos de la región seleccionada
  const regionSeleccionadaData = datosUbicacion.find(d => {
    const nombreRegion = d.region || d.nombre;
    return nombreRegion === formData.region;
  });

  // Lista de comunas pertenecientes a la región
  const listaComunas = regionSeleccionadaData 
    ? (regionSeleccionadaData.comunas || regionSeleccionadaData.comuna || [])
    : [];

  return (
    <main className="container my-5 d-flex justify-content-center">
      <div className="card shadow-sm border-0 rounded-4 p-4" style={{ width: '100%', maxWidth: '800px' }}>
        <div className="text-center mb-4">
          <div className="fs-1 text-warning mb-2">👤</div>
          <h2 className="fw-bold text-dark">Crea tu cuenta</h2>
          <p className="text-muted">Únete a nuestra comunidad de amantes de los perfumes</p>
        </div>

        {mensajeExito && (
          <div className="alert alert-success text-center fw-bold" role="alert">
            ¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="rut" className="form-label font-semibold">RUN (Sin puntos ni guion)</label>
              <input
                type="text"
                className={`form-control ${errors.rut ? 'is-invalid' : ''}`}
                id="rut"
                placeholder="Ej: 19011022K"
                value={formData.rut}
                onChange={handleChange}
              />
              {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="correo" className="form-label font-semibold">Correo Electrónico</label>
              <input
                type="email"
                className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                id="correo"
                placeholder="ejemplo@duoc.cl"
                value={formData.correo}
                onChange={handleChange}
              />
              {errors.correo && <div className="invalid-feedback">{errors.correo}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="nombre" className="form-label font-semibold">Nombres</label>
              <input
                type="text"
                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                id="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
              {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="apellido" className="form-label font-semibold">Apellidos</label>
              <input
                type="text"
                className={`form-control ${errors.apellido ? 'is-invalid' : ''}`}
                id="apellido"
                value={formData.apellido}
                onChange={handleChange}
              />
              {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="pass" className="form-label font-semibold">Contraseña</label>
              <input
                type="password"
                className={`form-control ${errors.pass ? 'is-invalid' : ''}`}
                id="pass"
                placeholder="4 a 10 caracteres"
                value={formData.pass}
                onChange={handleChange}
              />
              {errors.pass && <div className="invalid-feedback">{errors.pass}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="passConf" className="form-label font-semibold">Confirmar Contraseña</label>
              <input
                type="password"
                className={`form-control ${errors.passConf ? 'is-invalid' : ''}`}
                id="passConf"
                value={formData.passConf}
                onChange={handleChange}
              />
              {errors.passConf && <div className="invalid-feedback">{errors.passConf}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="fechaNac" className="form-label font-semibold">Fecha de Nacimiento (Opcional)</label>
              <input
                type="date"
                className="form-control"
                id="fechaNac"
                value={formData.fechaNac}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="region" className="form-label font-semibold">Región</label>
              <select
                className={`form-select ${errors.region ? 'is-invalid' : ''}`}
                id="region"
                value={formData.region}
                onChange={handleChange}
              >
                <option value="">-- Seleccione una región --</option>
                {datosUbicacion.map((item, idx) => {
                  const nombreRegion = item.region || item.nombre;
                  return (
                    <option key={idx} value={nombreRegion}>
                      {nombreRegion}
                    </option>
                  );
                })}
              </select>
              {errors.region && <div className="invalid-feedback">{errors.region}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="comuna" className="form-label font-semibold">Comuna</label>
              <select
                className={`form-select ${errors.comuna ? 'is-invalid' : ''}`}
                id="comuna"
                value={formData.comuna}
                onChange={handleChange}
                disabled={!formData.region}
              >
                <option value="">-- Seleccione una comuna --</option>
                {listaComunas.map((comuna, idx) => {
                  const nombreComuna = typeof comuna === 'string' ? comuna : (comuna.nombre || comuna.comuna);
                  return (
                    <option key={idx} value={nombreComuna}>
                      {nombreComuna}
                    </option>
                  );
                })}
              </select>
              {errors.comuna && <div className="invalid-feedback">{errors.comuna}</div>}
            </div>

            <div className="col-md-6 mb-4">
              <label htmlFor="direccion" className="form-label font-semibold">Dirección</label>
              <input
                type="text"
                className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                id="direccion"
                placeholder="Calle, número, depto"
                value={formData.direccion}
                onChange={handleChange}
              />
              {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
            </div>
          </div>

          <button type="submit" className="btn btn-warning w-100 fw-bold py-2">
            Registrarse
          </button>

          <div className="text-center mt-3">
            <span className="text-muted">¿Ya tienes cuenta? </span>
            <button 
              type="button" 
              className="btn btn-link p-0 fw-bold text-decoration-none text-dark"
              onClick={onIrALogin}
            >
              Inicia sesión
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}