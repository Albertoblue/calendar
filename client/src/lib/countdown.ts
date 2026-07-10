import { startOfDay, differenceInCalendarDays } from 'date-fns';
import { Countdown } from '../types';

/** Devuelve la proxima fecha en que ocurre el countdown (calcula el proximo aniversario si es anual). */
export function nextOccurrence(c: Countdown): Date {
  const target = new Date(c.date);
  if (!c.recurring) return startOfDay(target);
  const today = startOfDay(new Date());
  let next = new Date(today.getFullYear(), target.getMonth(), target.getDate());
  if (differenceInCalendarDays(next, today) < 0) {
    next = new Date(today.getFullYear() + 1, target.getMonth(), target.getDate());
  }
  return next;
}

/** Dias que faltan (negativo si ya paso, para countdowns de una sola vez). */
export function daysUntil(c: Countdown): number {
  return differenceInCalendarDays(nextOccurrence(c), startOfDay(new Date()));
}

/** Para aniversarios anuales: que numero de aniversario sera el proximo (o null). */
export function anniversaryNumber(c: Countdown): number | null {
  if (!c.recurring) return null;
  const n = nextOccurrence(c).getFullYear() - new Date(c.date).getFullYear();
  return n > 0 ? n : null;
}

/** Texto humano de cuanto falta. */
export function countdownLabel(days: number): string {
  if (days === 0) return '¡Hoy!';
  if (days === 1) return 'Manana';
  if (days > 0) return `Faltan ${days} dias`;
  if (days === -1) return 'Fue ayer';
  return `Hace ${Math.abs(days)} dias`;
}

/** Ordena por proximidad: primero lo que esta por venir, luego lo pasado. */
export function sortByProximity(list: Countdown[]): Countdown[] {
  return [...list].sort((a, b) => {
    const da = daysUntil(a);
    const db = daysUntil(b);
    const fa = da < 0 ? 1 : 0;
    const fb = db < 0 ? 1 : 0;
    if (fa !== fb) return fa - fb; // futuros antes que pasados
    return fa === 0 ? da - db : db - da;
  });
}
