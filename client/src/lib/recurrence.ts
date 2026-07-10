import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Recurrence } from '../types';

const FREQ_TEXT: Record<string, string> = {
  daily: 'cada dia',
  weekly: 'cada semana',
  monthly: 'cada mes',
};

export function recurrenceText(r: Recurrence): string {
  let text = `Se repite ${FREQ_TEXT[r.freq] ?? ''}`.trim();
  if (r.until) {
    text += ` hasta el ${format(new Date(r.until), "d 'de' MMMM yyyy", { locale: es })}`;
  }
  return text;
}
