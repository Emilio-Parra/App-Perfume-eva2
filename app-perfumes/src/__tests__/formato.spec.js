import { clp } from '../utils/formato';

describe('utils/formato - clp()', () => {
  it('formatea un número como pesos chilenos con separador de miles', () => {
    expect(clp(39990)).toBe('$39.990');
  });

  it('devuelve $0 cuando el valor es vacío o indefinido', () => {
    expect(clp(undefined)).toBe('$0');
    expect(clp(0)).toBe('$0');
  });
});
