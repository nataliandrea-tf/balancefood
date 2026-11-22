// Formatea un monto en pesos chilenos con separador de miles ("." en Chile).
// Se hace a mano para no depender de Intl, que en Android (Hermes) a veces no
// formatea con separadores.
export function formatoCLP(monto: number | null | undefined): string {
  if (monto == null) {
    return '—';
  }
  const entero = Math.round(monto).toString();
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${conPuntos}`;
}
