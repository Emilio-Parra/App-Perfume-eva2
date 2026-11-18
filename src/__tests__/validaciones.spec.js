import { validarRut, validarCorreo } from '../utils/validaciones';

describe('utils/validaciones - validarRut()', () => {
  it('acepta un RUN con dígito verificador correcto', () => {
    expect(validarRut('123456785')).toBeTrue();
  });

  it('rechaza un RUN con dígito verificador incorrecto', () => {
    expect(validarRut('123456786')).toBeFalse();
  });

  it('rechaza textos que no tienen formato de RUN', () => {
    expect(validarRut('abc')).toBeFalse();
    expect(validarRut('12.345.678-5')).toBeFalse();
  });
});

describe('utils/validaciones - validarCorreo()', () => {
  it('acepta solo los dominios permitidos', () => {
    expect(validarCorreo('ana@duoc.cl')).toBeTrue();
    expect(validarCorreo('ana@gmail.com')).toBeTrue();
    expect(validarCorreo('ana@hotmail.com')).toBeFalse();
  });

  it('rechaza correos vacíos', () => {
    expect(validarCorreo('')).toBeFalse();
  });
});
