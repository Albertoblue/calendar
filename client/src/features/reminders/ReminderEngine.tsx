import { useEffect, useRef } from 'react';
import { Toast, ToastTitle, ToastBody, useToastController } from '@fluentui/react-components';
import { Activity } from '../../types';
import { reminderLabel } from '../../lib/reminders';

export const REMINDER_TOASTER_ID = 'reminder-toaster';

const STORAGE_KEY = 'firedReminders';
const CHECK_INTERVAL = 30_000; // cada 30s
const GRACE = 5 * 60_000; // no dispares recordatorios con mas de 5 min de retraso

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveFired(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

/**
 * Motor de recordatorios en el cliente: mientras la app este abierta, revisa las
 * proximas actividades y avisa (notificacion del navegador o toast) cuando llega
 * el momento de un recordatorio. Recuerda lo ya avisado en localStorage.
 */
export function ReminderEngine({ activities }: { activities: Activity[] }) {
  const { dispatchToast } = useToastController(REMINDER_TOASTER_ID);
  const fired = useRef<Set<string>>(loadFired());
  const activitiesRef = useRef<Activity[]>(activities);
  activitiesRef.current = activities;

  useEffect(() => {
    const notify = (a: Activity, minutesBefore: number) => {
      const body =
        minutesBefore === 0
          ? 'Empieza ahora'
          : `Empieza en ${reminderLabel(minutesBefore).replace(' antes', '')}`;

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`🔔 ${a.title}`, { body });
          return;
        } catch {
          /* si falla, caemos al toast */
        }
      }
      dispatchToast(
        <Toast>
          <ToastTitle>🔔 {a.title}</ToastTitle>
          <ToastBody>{body}</ToastBody>
        </Toast>,
        { intent: 'info', timeout: 10_000 }
      );
    };

    const check = () => {
      const now = Date.now();
      for (const a of activitiesRef.current) {
        if (a.status === 'cancelled' || !a.reminders?.length) continue;
        const start = new Date(a.start).getTime();
        for (const minutesBefore of a.reminders) {
          const fireAt = start - minutesBefore * 60_000;
          // Ya llego el momento, no hace mas de 5 min, y la actividad no empezo hace rato.
          if (fireAt <= now && now - fireAt < GRACE && now < start + 60_000) {
            const key = `${a._id}:${minutesBefore}:${a.start}`;
            if (fired.current.has(key)) continue;
            fired.current.add(key);
            saveFired(fired.current);
            notify(a, minutesBefore);
          }
        }
      }
    };

    check();
    const id = window.setInterval(check, CHECK_INTERVAL);
    return () => window.clearInterval(id);
  }, [dispatchToast]);

  return null;
}
