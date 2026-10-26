// Devuelve la fecha de hoy en formato AAAA-MM-DD según la hora local.
// No usar toISOString(): convierte a UTC y en Chile, después de las 21:00,
// entrega la fecha del día siguiente.
export function hoyLocal() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}
