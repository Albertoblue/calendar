import { useState } from 'react';
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Text,
  Caption1,
  Divider,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Alert20Regular, Alert20Filled } from '@fluentui/react-icons';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity } from '../../types';

const useStyles = makeStyles({
  iconBtn: { color: '#fff', minWidth: '32px' },
  surface: { width: '320px', display: 'flex', flexDirection: 'column', gap: '8px' },
  list: { display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '320px', overflowY: 'auto' },
  item: { display: 'flex', gap: '8px', alignItems: 'center', padding: '6px 4px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  body: { flexGrow: 1, minWidth: 0 },
  sub: { color: tokens.colorNeutralForeground3 },
});

function whenLabel(iso: string): string {
  const d = new Date(iso);
  const time = format(d, 'HH:mm');
  if (isToday(d)) return `Hoy ${time}`;
  if (isTomorrow(d)) return `Manana ${time}`;
  return format(d, 'd MMM HH:mm', { locale: es });
}

export function NotificationsBell({ activities }: { activities: Activity[] }) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const upcoming = [...activities]
    .filter((a) => a.status !== 'cancelled')
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 8);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    setPermission(await Notification.requestPermission());
  };

  return (
    <Popover open={open} onOpenChange={(_, d) => setOpen(d.open)} positioning="below-end">
      <PopoverTrigger disableButtonEnhancement>
        <Button
          appearance="transparent"
          className={styles.iconBtn}
          icon={upcoming.length ? <Alert20Filled /> : <Alert20Regular />}
          aria-label="Notificaciones"
        />
      </PopoverTrigger>
      <PopoverSurface>
        <div className={styles.surface}>
          <Text weight="semibold">Proximas actividades</Text>

          {permission !== 'granted' && (
            <MessageBar intent="info">
              <MessageBarBody>
                Activa las notificaciones del navegador para recibir avisos.{' '}
                <Button size="small" appearance="primary" onClick={requestPermission}>
                  Activar
                </Button>
              </MessageBarBody>
            </MessageBar>
          )}

          <Divider />

          {upcoming.length === 0 ? (
            <Caption1 className={styles.sub}>No hay actividades en las proximas 48 horas.</Caption1>
          ) : (
            <div className={styles.list}>
              {upcoming.map((a) => (
                <div key={a._id} className={styles.item}>
                  <span className={styles.dot} style={{ backgroundColor: a.color }} />
                  <div className={styles.body}>
                    <Text>{a.title}</Text>
                    <br />
                    <Caption1 className={styles.sub}>
                      {whenLabel(a.start)}
                      {a.reminders && a.reminders.length > 0 ? ' · 🔔' : ''}
                    </Caption1>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverSurface>
    </Popover>
  );
}
