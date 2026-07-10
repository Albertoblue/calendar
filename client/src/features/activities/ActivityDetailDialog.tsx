import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  Button,
  Badge,
  Text,
  Divider,
  Tooltip,
  MessageBar,
  MessageBarBody,
  MessageBarActions,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Clock20Regular,
  Location20Regular,
  Person20Regular,
  Notepad20Regular,
  Edit20Regular,
  Delete20Regular,
  Star20Regular,
  Alert20Regular,
  ArrowRepeatAll20Regular,
} from '@fluentui/react-icons';
import { StarRating } from '../memories/StarRating';
import { reminderLabel } from '../../lib/reminders';
import { recurrenceText } from '../../lib/recurrence';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, ActivityStatus, Category } from '../../types';

const useStyles = makeStyles({
  surface: { padding: 0, overflow: 'hidden', maxWidth: '460px' },
  header: { padding: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: { fontSize: '28px', lineHeight: 1 },
  headerTitle: { fontSize: '20px', fontWeight: 600 },
  body: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  row: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  rowIcon: { color: tokens.colorNeutralForeground3, flexShrink: 0, marginTop: '2px' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' },
});

const STATUS: Record<ActivityStatus, { label: string; color: 'informative' | 'success' | 'danger' }> = {
  planned: { label: 'Planeada', color: 'informative' },
  done: { label: 'Hecha', color: 'success' },
  cancelled: { label: 'Cancelada', color: 'danger' },
};

interface Props {
  activity: Activity | null;
  category?: Category | null;
  authorName: string;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onMakeMemory: (activity: Activity) => void;
  busy?: boolean;
}

function formatWhen(a: Activity): string {
  const s = new Date(a.start);
  const e = new Date(a.end);
  if (a.allDay) {
    return `Todo el dia · ${format(s, "EEEE d 'de' MMMM", { locale: es })}`;
  }
  const sameDay = format(s, 'yyyy-MM-dd') === format(e, 'yyyy-MM-dd');
  if (sameDay) {
    return `${format(s, "EEEE d 'de' MMMM", { locale: es })} · ${format(s, 'HH:mm')} - ${format(
      e,
      'HH:mm'
    )}`;
  }
  return `${format(s, 'd MMM HH:mm', { locale: es })} - ${format(e, 'd MMM HH:mm', { locale: es })}`;
}

export function ActivityDetailDialog({
  activity,
  category,
  authorName,
  onClose,
  onEdit,
  onDelete,
  onMakeMemory,
  busy,
}: Props) {
  const styles = useStyles();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setConfirming(false);
  }, [activity]);

  if (!activity) return null;
  const status = STATUS[activity.status];
  const isRecurring = Boolean(activity.isOccurrence || activity.recurrence);

  return (
    <Dialog open={Boolean(activity)} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface className={styles.surface}>
        <DialogBody style={{ display: 'block' }}>
          <div className={styles.header} style={{ backgroundColor: activity.color }}>
            <span className={styles.headerIcon}>{category?.icon ?? '📌'}</span>
            <span className={styles.headerTitle}>{activity.title}</span>
          </div>

          <div className={styles.body}>
            <div className={styles.row}>
              <Clock20Regular className={styles.rowIcon} />
              <Text>{formatWhen(activity)}</Text>
            </div>

            {activity.location && (
              <div className={styles.row}>
                <Location20Regular className={styles.rowIcon} />
                <Text>{activity.location}</Text>
              </div>
            )}

            <div className={styles.row}>
              <Person20Regular className={styles.rowIcon} />
              <Text>Propuesta por {authorName}</Text>
            </div>

            {activity.reminders && activity.reminders.length > 0 && (
              <div className={styles.row}>
                <Alert20Regular className={styles.rowIcon} />
                <Text>{activity.reminders.map(reminderLabel).join(' · ')}</Text>
              </div>
            )}

            {activity.recurrence && (
              <div className={styles.row}>
                <ArrowRepeatAll20Regular className={styles.rowIcon} />
                <Text>{recurrenceText(activity.recurrence)}</Text>
              </div>
            )}

            <div className={styles.row}>
              <Badge appearance="tint" color={status.color}>
                {status.label}
              </Badge>
              {category && (
                <Badge appearance="tint" style={{ backgroundColor: `${category.color}22` }}>
                  {category.icon} {category.name}
                </Badge>
              )}
            </div>

            {activity.description && (
              <>
                <Divider />
                <div className={styles.row}>
                  <Notepad20Regular className={styles.rowIcon} />
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{activity.description}</Text>
                </div>
              </>
            )}

            {activity.memory &&
            (activity.memory.rating || activity.memory.notes || activity.memory.photos?.length) ? (
              <>
                <Divider>Recuerdo</Divider>
                {activity.memory.rating ? (
                  <StarRating value={activity.memory.rating} size={16} />
                ) : null}
                {activity.memory.notes && (
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{activity.memory.notes}</Text>
                )}
                {activity.memory.photos && activity.memory.photos.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {activity.memory.photos.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Recuerdo"
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6 }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : null}

            {confirming && (
              <MessageBar intent="warning">
                <MessageBarBody>¿Seguro que quieres eliminar esta actividad?</MessageBarBody>
                <MessageBarActions>
                  <Button
                    size="small"
                    appearance="primary"
                    onClick={() => onDelete(activity)}
                    disabled={busy}
                  >
                    Si, eliminar
                  </Button>
                  <Button size="small" onClick={() => setConfirming(false)}>
                    Cancelar
                  </Button>
                </MessageBarActions>
              </MessageBar>
            )}

            <div className={styles.actions}>
              <Button
                icon={<Star20Regular />}
                appearance="primary"
                onClick={() => onMakeMemory(activity)}
                style={{ marginRight: 'auto' }}
              >
                {activity.status === 'done' ? 'Editar recuerdo' : 'Marcar como vivida'}
              </Button>
              <Tooltip content="Eliminar" relationship="label">
                <Button
                  icon={<Delete20Regular />}
                  appearance="subtle"
                  onClick={() => (isRecurring ? onDelete(activity) : setConfirming(true))}
                  disabled={busy}
                />
              </Tooltip>
              <Button icon={<Edit20Regular />} appearance="subtle" onClick={() => onEdit(activity)}>
                Editar
              </Button>
            </div>
          </div>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
