
import React, { useState } from 'react';

export function LoginPage({ onLoginSuccess, onIrARegistro }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [mensajeExito, setMensajeExito] = useState(false);
  const [iniciandoSesion, setIniciandoSesion] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (iniciandoSesion) return;

    let newErrors = {};
    setMensajeExito(false);

    // 1. Validar correo
    const emailVal = correo.trim();
    const dominiosPermitidos = [
      '@duoc.cl',
      '@profesor.duoc.cl',
      '@gmail.com'
    ];

    const esDominioValido = dominiosPermitidos.some(
      (d) => emailVal.endsWith(d)
    );

    if (!emailVal) {
      newErrors.correo = 'El correo es obligatorio.';
    } else if (emailVal.length > 100) {
      newErrors.correo =
        'El correo no puede exceder los 100 caracteres.';
    } else if (!esDominioValido) {
      newErrors.correo =
        'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';
    }

    // 2. Validar contraseña
    const passVal = password.trim();

    if (!passVal) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (passVal.length < 4 || passVal.length > 10) {
      newErrors.password =
        'La contraseña debe tener entre 4 y 10 caracteres.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIniciandoSesion(true);

    try {
      // Los clientes y el administrador se validan siempre con Spring Boot.
      // La cuenta de administrador usa su endpoint separado en MySQL.
      const esAdministrador = emailVal.toLowerCase() === 'admin@duoc.cl';
      const endpoint = esAdministrador
        ? '/api/admin/login'
        : '/api/usuarios/login';

      const respuesta = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          correo: emailVal,
          pass: passVal
        })
      });

      const resultado = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setErrors({
          general: resultado?.error || 'Correo o contraseña incorrectos.'
        });
        return;
      }

      if (!resultado || !resultado.id) {
        setErrors({
          general: 'El servidor no devolvió una cuenta válida.'
        });
        return;
      }

      // Evitar aceptar un rol incorrecto para el endpoint usado.
      if (esAdministrador && resultado.rol !== 'admin') {
        setErrors({ general: 'No se pudo validar al administrador.' });
        return;
      }

      // La autenticación del administrador y su perfil son datos diferentes.
      // Consultar el perfil real después del login evita usar un nombre anterior
      // que pudiera quedar en el estado o en el navegador.
      let usuarioEncontrado = resultado;
      if (esAdministrador) {
        const respuestaPerfil = await fetch(`/api/admin/perfil?actualizar=${Date.now()}`, {
          credentials: 'same-origin',
          cache: 'no-store'
        });
        const perfil = await respuestaPerfil.json().catch(() => null);
        if (!respuestaPerfil.ok || perfil?.rol !== 'admin' || !perfil?.id) {
          setErrors({ general: 'Iniciaste sesión, pero no se pudo recuperar el perfil desde MySQL.' });
          return;
        }
        usuarioEncontrado = { ...resultado, ...perfil };
      }

      // Guardar los datos de la sesión actual
      localStorage.setItem(
        'usuario_actual',
        JSON.stringify(usuarioEncontrado)
      );

      setMensajeExito(true);

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(usuarioEncontrado);
        }
      }, 1200);

    } catch (error) {
      console.error('Error al iniciar sesión:', error);

      setErrors({
        general:
          'No se pudo conectar con el servidor. Comprueba que Spring Boot esté funcionando.'
      });

    } finally {
      setIniciandoSesion(false);
    }
  };

  return (
    <main
      className="container my-5 d-flex justify-content-center align-items-center"
      style={{ minHeight: '60vh' }}
    >
      <div
        className="card shadow-sm border-0 rounded-4 p-4"
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <div className="text-center mb-4">
          <div className="fs-1 text-warning mb-2">
            🔑
          </div>

          <h2 className="fw-bold text-dark">
            Inicia tu sesión
          </h2>

          <p className="text-muted">
            Ingresa a tu cuenta de Perfumes Store
          </p>
        </div>

        {mensajeExito && (
          <div
            className="alert alert-success text-center fw-bold"
            role="alert"
          >
            ¡Sesión iniciada con éxito! Entrando...
          </div>
        )}

        {errors.general && (
          <div
            className="alert alert-danger text-center small mb-3"
            role="alert"
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          <div className="mb-3">
            <label
              htmlFor="correoLogin"
              className="form-label font-semibold"
            >
              Correo Electrónico
            </label>

            <input
              type="email"
              className={`form-control ${
                errors.correo ? 'is-invalid' : ''
              }`}
              id="correoLogin"
              placeholder="ejemplo@duoc.cl"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={iniciandoSesion}
            />

            {errors.correo && (
              <div className="invalid-feedback">
                {errors.correo}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="passLogin"
              className="form-label font-semibold"
            >
              Contraseña
            </label>

            <input
              type="password"
              className={`form-control ${
                errors.password ? 'is-invalid' : ''
              }`}
              id="passLogin"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={iniciandoSesion}
            />

            {errors.password && (
              <div className="invalid-feedback">
                {errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold mb-3 py-2"
            disabled={iniciandoSesion}
          >
            {iniciandoSesion
              ? 'Iniciando sesión...'
              : 'Iniciar Sesión'}
          </button>

          <div className="text-center">
            <span className="text-muted">
              ¿No tienes cuenta?{' '}
            </span>

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
