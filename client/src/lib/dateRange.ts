import { startOfMonth, endOfMonth, subDays, addDays } from 'date-fns';

/**
 * Devuelve un rango generoso (mes visible +/- una semana) para pedir
 * actividades al backend. Al cambiar de mes, la query se refresca sola.
 */
export function monthRange(date: Date): { from: string; to: string } {
  const from = subDays(startOfMonth(date), 7);
  const to = addDays(endOfMonth(date), 7);
  return { from: from.toISOString(), to: to.toISOString() };
}
