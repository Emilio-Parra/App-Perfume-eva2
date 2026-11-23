
 // Autenticación y renovación automática de JWT para las llamadas a la API.
 // Conserva el formato de sesión existente: localStorage['usuario_actual'].

export const CLAVE_SESION = 'usuario_actual';
export const EVENTO_SESION_EXPIRADA = 'sesion-expirada';

const URL_REFRESH = '/api/v1/auth/refresh';
let renovacionEnCurso = null;

const leerSesion = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null');
  } catch {
    return null;
  }
};

export const obtenerToken = () => leerSesion()?.token || null;

export const encabezadoAuth = (token = obtenerToken()) =>
  token ? { Authorization: `Bearer ${token}` } : {};

const obtenerUrl = (entrada) => {
  if (typeof entrada === 'string') return entrada;
  if (entrada instanceof URL) return entrada.href;
  return entrada?.url || '';
};

const esLlamadaApi = (url) =>
  url.startsWith('/api/') ||
  url.startsWith(`${window.location.origin}/api/`);

const esLogin = (url) =>
  /\/(usuarios|admin)\/login(?:[?#]|$)/.test(url);

const esRefresh = (url) =>
  /\/auth\/refresh(?:[?#]|$)/.test(url);

const esLogout = (url) =>
  /\/(usuarios|admin)\/logout(?:[?#]|$)/.test(url);

const cerrarSesionExpirada = (tokenAnterior) => {
  // Evita cerrar una sesión nueva si el usuario volvió a iniciar sesión.
  if (leerSesion()?.token !== tokenAnterior) return;

  localStorage.removeItem(CLAVE_SESION);
  window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
};

export const instalarAuthFetch = () => {
  if (window.__authFetchInstalado) return;

  const fetchOriginal = window.fetch.bind(window);

  const renovarAcceso = async (tokenAnterior) => {
    // Evita realizar varias renovaciones al mismo tiempo.
    if (renovacionEnCurso) return renovacionEnCurso;

    renovacionEnCurso = (async () => {
      const sesion = leerSesion();

      if (!sesion?.refreshToken || sesion.token !== tokenAnterior) {
        return null;
      }

      let respuesta;

      try {
        // Utilizar fetchOriginal impide interceptar la propia renovación.
        respuesta = await fetchOriginal(URL_REFRESH, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refreshToken: sesion.refreshToken
          })
        });
      } catch {
        // No borrar la sesión por un problema temporal de conexión.
        return null;
      }

      if (!respuesta.ok) {
        // El servidor rechazó el refresh token.
        if ([400, 401, 403].includes(respuesta.status)) {
          cerrarSesionExpirada(tokenAnterior);
        }

        return null;
      }

      const datos = await respuesta.json().catch(() => null);

      if (typeof datos?.token !== 'string' || !datos.token) {
        return null;
      }

      const sesionActual = leerSesion();

      // No mezclar tokens de sesiones diferentes.
      if (
        sesionActual?.token !== tokenAnterior ||
        sesionActual?.refreshToken !== sesion.refreshToken
      ) {
        return null;
      }

      // Mantener el perfil, el rol y el refresh token original.
      localStorage.setItem(
        CLAVE_SESION,
        JSON.stringify({
          ...sesionActual,
          token: datos.token
        })
      );

      return datos.token;
    })().finally(() => {
      renovacionEnCurso = null;
    });

    return renovacionEnCurso;
  };

  window.fetch = async (entrada, opciones = {}) => {
    const url = obtenerUrl(entrada);

    // No modificar solicitudes externas a nuestra API.
    if (!esLlamadaApi(url)) {
      return fetchOriginal(entrada, opciones);
    }

    const copiaParaReintento =
      entrada instanceof Request ? entrada.clone() : entrada;

    const encabezados = new Headers(
      opciones.headers ||
      (entrada instanceof Request ? entrada.headers : undefined)
    );

    const rutaDeAutenticacion = esLogin(url) || esRefresh(url);
    const sesionOriginal = leerSesion();
    const tokenActual = sesionOriginal?.token || null;
    const authExplicito = encabezados.get('Authorization');

    // Agregar automáticamente el token de acceso.
    if (!rutaDeAutenticacion && tokenActual && !authExplicito) {
      encabezados.set('Authorization', `Bearer ${tokenActual}`);
    }

    const respuesta = await fetchOriginal(entrada, {
      ...opciones,
      headers: encabezados
    });

    // Renovar únicamente cuando una petición protegida devuelve 401.
    if (
      respuesta.status !== 401 ||
      !tokenActual ||
      rutaDeAutenticacion ||
      esLogout(url)
    ) {
      return respuesta;
    }

    // Respetar tokens colocados explícitamente por otros componentes.
    if (
      authExplicito &&
      authExplicito !== `Bearer ${tokenActual}`
    ) {
      return respuesta;
    }

    // Compatibilidad con sesiones antiguas sin refresh token.
    if (!sesionOriginal?.refreshToken) {
      cerrarSesionExpirada(tokenActual);
      return respuesta;
    }

    const sesionVigente = leerSesion();

    if (
      sesionVigente?.refreshToken !== sesionOriginal.refreshToken
    ) {
      return respuesta;
    }

    let tokenNuevo = sesionVigente?.token;

    // Si otra petición ya renovó el token, reutilizarlo.
    if (tokenNuevo === tokenActual) {
      tokenNuevo = await renovarAcceso(tokenActual);
    }

    if (!tokenNuevo || tokenNuevo === tokenActual) {
      return respuesta;
    }

    // Reintentar la petición original con el nuevo token.
    const encabezadosReintento = new Headers(encabezados);

    encabezadosReintento.set(
      'Authorization',
      `Bearer ${tokenNuevo}`
    );

    return fetchOriginal(copiaParaReintento, {
      ...opciones,
      headers: encabezadosReintento
    });
  };

  window.__authFetchInstalado = true;
};
