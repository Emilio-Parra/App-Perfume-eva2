import React, { useState } from 'react';

export function LoginPage({ onLoginSuccess, onIrARegistro }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [mensajeExito, setMensajeExito] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    setMensajeExito(false);

    // 1. Validar Correo
    const emailVal = correo.trim();
    const dominiosPermitidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    const esDominioValido = dominiosPermitidos.some(d => emailVal.endsWith(d));

    if (!emailVal) {
      newErrors.correo = 'El correo es obligatorio.';
    } else if (emailVal.length > 100) {
      newErrors.correo = 'El correo no puede exceder los 100 caracteres.';
    } else if (!esDominioValido) {
      newErrors.correo = 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';
    }

    // 2. Validar Contraseña
    const passVal = password.trim();
    if (!passVal) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (passVal.length < 4 || passVal.length > 10) {
      newErrors.password = 'La contraseña debe tener entre 4 y 10 caracteres.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Obtener usuarios desde localStorage
      const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_perfumes') || '[]');
      
      const usuarioEncontrado = usuariosGuardados.find(
        u => u.correo === emailVal && u.pass === passVal
      );

      if (!usuarioEncontrado) {
        setErrors({ general: 'Correo o contraseña incorrectos. Verifica tus datos o regístrate.' });
        return;
      }

      // Guardar sesión activa
      localStorage.setItem('usuario_actual', JSON.stringify(usuarioEncontrado));
      setMensajeExito(true);

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(usuarioEncontrado);
      }, 1200);
    }
  };

  return (
    <main className="container my-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="card shadow-sm border-0 rounded-4 p-4" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <div className="fs-1 text-warning mb-2">🔑</div>
          <h2 className="fw-bold text-dark">Inicia tu sesión</h2>
          <p className="text-muted">Ingresa a tu cuenta de Perfumes Store</p>
        </div>

        {mensajeExito && (
          <div className="alert alert-success text-center fw-bold" role="alert">
            ¡Sesión iniciada con éxito! Entrando...
          </div>
        )}

        {errors.general && (
          <div className="alert alert-danger text-center small mb-3" role="alert">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="correoLogin" className="form-label font-semibold">Correo Electrónico</label>
            <input
              type="email"
              className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
              id="correoLogin"
              placeholder="ejemplo@duoc.cl"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            {errors.correo && <div className="invalid-feedback">{errors.correo}</div>}
          </div>

          <div className="mb-4">
            <label htmlFor="passLogin" className="form-label font-semibold">Contraseña</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              id="passLogin"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-warning w-100 fw-bold mb-3 py-2">
            Iniciar Sesión
          </button>

          <div className="text-center">
            <span className="text-muted">¿No tienes cuenta? </span>
            <button
              type="button"
              className="btn btn-link p-0 fw-bold text-decoration-none text-dark"
              onClick={onIrARegistro}
            >
              Regístrate aquí
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}