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

// Fecha de hoy en formato YYYY-MM-DD según la hora local del dispositivo.
// Se usa la fecha local (no UTC) para que un consumo de la noche no quede
// registrado con la fecha del día siguiente.
export function fechaHoy(): string {
  const d = new Date();
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}
