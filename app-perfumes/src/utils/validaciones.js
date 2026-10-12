export const DOMINIOS_PERMITIDOS = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];

// Algoritmo Módulo 11 para el RUN (sin puntos ni guion, ej. 19011022K)
export const validarRut = (rut) => {
  if (!/^[0-9]+[0-9kK]$/.test(rut)) return false;
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();
  let suma = 0;
  let mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += mult * Number(cuerpo[i]);
    mult = mult < 7 ? mult + 1 : 2;
  }
  const esperado = 11 - (suma % 11);
  const dvEsperado = esperado === 11 ? '0' : esperado === 10 ? 'K' : String(esperado);
  return dv === dvEsperado;
};

export const validarCorreo = (correo) =>
  correo.length > 0 &&
  correo.length <= 100 &&
  DOMINIOS_PERMITIDOS.some((d) => correo.endsWith(d));
