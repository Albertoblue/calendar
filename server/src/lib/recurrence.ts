import { Types } from 'mongoose';
import { IActivity } from '../models/Activity';

const MAX_OCCURRENCES = 500;

type MasterActivity = IActivity & { _id: Types.ObjectId };

function advance(date: Date, freq: string, interval: number): Date {
  const d = new Date(date);
  if (freq === 'daily') d.setDate(d.getDate() + interval);
  else if (freq === 'weekly') d.setDate(d.getDate() + 7 * interval);
  else d.setMonth(d.getMonth() + interval); // monthly
  return d;
}

/**
 * Expande un evento maestro recurrente en sus ocurrencias virtuales dentro de
 * [from, to]. No se almacenan; se generan al vuelo. Cada ocurrencia lleva
 * masterId/occurrenceDate para poder editarla o excluirla luego.
 */
export function expandOccurrences(
  master: MasterActivity,
  from: Date,
  to: Date
): Record<string, unknown>[] {
  if (!master.recurrence) return [];
  const { freq, until } = master.recurrence;
  const step = master.recurrence.interval > 0 ? master.recurrence.interval : 1;

  const masterStart = new Date(master.start);
  const masterEnd = new Date(master.end);
  const duration = masterEnd.getTime() - masterStart.getTime();
  const exceptions = new Set((master.exceptions ?? []).map((d) => new Date(d).getTime()));
  const limit = until ? Math.min(new Date(until).getTime(), to.getTime()) : to.getTime();

  const out: Record<string, unknown>[] = [];
  let cursor = new Date(masterStart);
  let count = 0;

  while (cursor.getTime() <= limit && count < MAX_OCCURRENCES) {
    count++;
    const startMs = cursor.getTime();
    if (startMs >= from.getTime() && startMs <= to.getTime() && !exceptions.has(startMs)) {
      const occStart = new Date(startMs);
      out.push({
        ...master,
        _id: `${master._id.toString()}::${occStart.toISOString()}`,
        masterId: master._id.toString(),
        masterStart: masterStart.toISOString(),
        masterEnd: masterEnd.toISOString(),
        occurrenceDate: occStart.toISOString(),
        isOccurrence: true,
        start: occStart,
        end: new Date(startMs + duration),
      });
    }
    cursor = advance(cursor, freq, step);
  }
  return out;
}
