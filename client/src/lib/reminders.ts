// Opciones de recordatorio, en minutos antes del inicio de la actividad.
export const REMINDER_OPTIONS = [0, 5, 10, 30, 60, 120, 1440] as const;

export function reminderLabel(minutes: number): string {
  if (minutes === 0) return 'Al comenzar';
  if (minutes < 60) return `${minutes} min antes`;
  if (minutes < 1440) {
    const h = minutes / 60;
    return `${h} ${h === 1 ? 'hora' : 'horas'} antes`;
  }
  const d = minutes / 1440;
  return `${d} ${d === 1 ? 'dia' : 'dias'} antes`;
}
