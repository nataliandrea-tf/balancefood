import {formatoCLP} from '../src/utils/format';

describe('formatoCLP', () => {
  it('agrega separador de miles con punto', () => {
    expect(formatoCLP(48000)).toBe('$48.000');
    expect(formatoCLP(1250)).toBe('$1.250');
  });

  it('maneja montos chicos sin separador', () => {
    expect(formatoCLP(900)).toBe('$900');
  });

  it('muestra un guion cuando el monto es nulo', () => {
    expect(formatoCLP(null)).toBe('—');
    expect(formatoCLP(undefined)).toBe('—');
  });
});
