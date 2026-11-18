// Autenticación con JWT para todas las llamadas al backend.
//
// Al iniciar sesión, Spring Boot devuelve un "token" que se guarda junto
// con el usuario en localStorage ('usuario_actual').
// Este archivo envuelve window.fetch para que TODA petición a /api/...
// lleve automáticamente el encabezado:
//
//     Authorization: Bearer <token>
//
// Así no hay que modificar cada fetch de los services y componentes.

export const CLAVE_SESION = 'usuario_actual';
export const EVENTO_SESION_EXPIRADA = 'sesion-expirada';

// Leer el token guardado (null si no hay sesión)
export const obtenerToken = () => {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null');
    return sesion?.token || null;
  } catch {
    return null;
  }
};

// Encabezado listo para usar en un fetch puntual
export const encabezadoAuth = (token = obtenerToken()) =>
  token ? { Authorization: `Bearer ${token}` } : {};

const obtenerUrl = (entrada) => {
  if (typeof entrada === 'string') return entrada;
  if (entrada instanceof URL) return entrada.href;
  return entrada?.url || '';
};

const esLlamadaApi = (url) =>
  url.startsWith('/api/') || url.startsWith(`${window.location.origin}/api/`);

const esLogin = (url) => /\/(usuarios|admin)\/login/.test(url);

export const instalarAuthFetch = () => {
  if (window.__authFetchInstalado) return;

  const fetchOriginal = window.fetch.bind(window);

  window.fetch = async (entrada, opciones = {}) => {
    const url = obtenerUrl(entrada);

    if (!esLlamadaApi(url)) {
      return fetchOriginal(entrada, opciones);
    }

    const token = obtenerToken();
    const encabezados = new Headers(
      opciones.headers || (entrada instanceof Request ? entrada.headers : undefined)
    );

    // Si el componente ya puso su propio Authorization, se respeta
    if (token && !encabezados.has('Authorization')) {
      encabezados.set('Authorization', `Bearer ${token}`);
    }

    const respuesta = await fetchOriginal(entrada, { ...opciones, headers: encabezados });

    // 401 con token = el token venció o no es válido: se cierra la sesión local
    if (respuesta.status === 401 && token && !esLogin(url)) {
      localStorage.removeItem(CLAVE_SESION);
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }

    return respuesta;
  };

  window.__authFetchInstalado = true;
};
