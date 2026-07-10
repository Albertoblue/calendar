import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Field,
  Input,
  Textarea,
  Dropdown,
  Option,
  Checkbox,
  MessageBar,
  MessageBarBody,
  makeStyles,
} from '@fluentui/react-components';
import {
  format,
  parse,
  addHours,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Activity, ActivityInput, ActivityStatus, Category, RecurrenceFreq } from '../../types';
import { REMINDER_OPTIONS, reminderLabel } from '../../lib/reminders';

const RECUR_LABELS: Record<string, string> = {
  none: 'No se repite',
  daily: 'Cada dia',
  weekly: 'Cada semana',
  monthly: 'Cada mes',
};

const useStyles = makeStyles({
  content: { display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '420px' },
  row: { display: 'flex', gap: '12px' },
  grow: { flexGrow: 1 },
});

const STATUS_LABELS: Record<ActivityStatus, string> = {
  planned: 'Planeada',
  done: 'Hecha',
  cancelled: 'Cancelada',
};

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  activity?: Activity | null;
  slot?: { start: Date; end: Date } | null;
  /** Valores iniciales para una actividad nueva (p. ej. al agendar un deseo). */
  initial?: Partial<ActivityInput> | null;
  heading?: string;
  submitLabel?: string;
  /** Muestra el selector de recurrencia (false al editar solo una ocurrencia). */
  allowRecurrence?: boolean;
  onSubmit: (input: ActivityInput, id?: string) => void;
  busy?: boolean;
}

function parseLocal(value: string, allDay: boolean): Date | null {
  if (!value) return null;
  const pattern = allDay ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm";
  const parsed = parse(value, pattern, new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function ActivityDialog({
  open,
  onClose,
  categories,
  activity,
  slot,
  initial,
  heading,
  submitLabel,
  allowRecurrence = true,
  onSubmit,
  busy,
}: Props) {
  const styles = useStyles();
  const isEdit = Boolean(activity);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [color, setColor] = useState('#0F6CBD');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(addHours(new Date(), 1));
  const [allDay, setAllDay] = useState(false);
  const [status, setStatus] = useState<ActivityStatus>('planned');
  const [reminders, setReminders] = useState<number[]>([]);
  const [recurFreq, setRecurFreq] = useState<'none' | RecurrenceFreq>('none');
  const [recurUntil, setRecurUntil] = useState('');
  const [error, setError] = useState('');

  // Inicializa el formulario cada vez que se abre el dialogo.
  useEffect(() => {
    if (!open) return;
    setError('');
    if (activity) {
      setTitle(activity.title);
      setCategoryId(activity.categoryId ?? null);
      setColor(activity.color);
      setLocation(activity.location ?? '');
      setDescription(activity.description ?? '');
      setStart(new Date(activity.start));
      setEnd(new Date(activity.end));
      setAllDay(activity.allDay);
      setStatus(activity.status);
      setReminders(activity.reminders ?? []);
      setRecurFreq(activity.recurrence?.freq ?? 'none');
      setRecurUntil(
        activity.recurrence?.until
          ? format(new Date(activity.recurrence.until), 'yyyy-MM-dd')
          : ''
      );
    } else {
      const s = slot?.start ?? new Date();
      const e = slot?.end ?? addHours(s, 1);
      setTitle(initial?.title ?? '');
      setCategoryId(initial?.categoryId ?? null);
      setColor(initial?.color ?? '#0F6CBD');
      setLocation(initial?.location ?? '');
      setDescription(initial?.description ?? '');
      setStart(s);
      setEnd(e);
      setAllDay(initial?.allDay ?? false);
      setStatus('planned');
      setReminders(initial?.reminders ?? []);
      setRecurFreq(initial?.recurrence?.freq ?? 'none');
      setRecurUntil(
        initial?.recurrence?.until
          ? format(new Date(initial.recurrence.until), 'yyyy-MM-dd')
          : ''
      );
    }
  }, [open, activity, slot, initial]);

  const inputType = allDay ? 'date' : 'datetime-local';
  const fmt = allDay ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm";
  const selectedCategory = categories.find((c) => c._id === categoryId);

  const submit = () => {
    setError('');
    if (!title.trim()) {
      setError('El titulo es obligatorio.');
      return;
    }
    let s = start;
    let e = end;
    if (allDay) {
      s = startOfDay(start);
      e = endOfDay(end);
    }
    if (e < s) {
      setError('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }
    // undefined = no tocar recurrencia (modo detach); null = quitar; objeto = fijar.
    let recurrence: ActivityInput['recurrence'];
    if (allowRecurrence) {
      recurrence =
        recurFreq === 'none'
          ? null
          : {
              freq: recurFreq,
              interval: 1,
              until: recurUntil ? new Date(`${recurUntil}T23:59:59`).toISOString() : null,
            };
    }
    const input: ActivityInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      start: s.toISOString(),
      end: e.toISOString(),
      allDay,
      categoryId: categoryId || null,
      color,
      status,
      reminders,
      recurrence,
    };
    onSubmit(input, activity?._id);
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{heading ?? (isEdit ? 'Editar actividad' : 'Nueva actividad')}</DialogTitle>
          <DialogContent className={styles.content}>
            {error && (
              <MessageBar intent="error">
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}

            <Field label="Titulo" required>
              <Input
                value={title}
                onChange={(_, d) => setTitle(d.value)}
                placeholder="Ej: Cena en el italiano"
              />
            </Field>

            <div className={styles.row}>
              <div className={styles.grow}>
                <Field label="Categoria">
                  <Dropdown
                    placeholder="Sin categoria"
                    value={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : ''}
                    selectedOptions={categoryId ? [categoryId] : []}
                    onOptionSelect={(_, data) => {
                      const id = data.optionValue ?? null;
                      setCategoryId(id);
                      const cat = categories.find((c) => c._id === id);
                      if (cat) setColor(cat.color);
                    }}
                  >
                    {categories.map((c) => (
                      <Option key={c._id} value={c._id} text={`${c.icon} ${c.name}`}>
                        {c.icon} {c.name}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              </div>
              <Field label="Estado">
                <Dropdown
                  value={STATUS_LABELS[status]}
                  selectedOptions={[status]}
                  onOptionSelect={(_, data) =>
                    setStatus((data.optionValue as ActivityStatus) ?? 'planned')
                  }
                >
                  <Option value="planned" text="Planeada">
                    Planeada
                  </Option>
                  <Option value="done" text="Hecha">
                    Hecha
                  </Option>
                  <Option value="cancelled" text="Cancelada">
                    Cancelada
                  </Option>
                </Dropdown>
              </Field>
            </div>

            <Field label="Lugar">
              <Input
                value={location}
                onChange={(_, d) => setLocation(d.value)}
                placeholder="Ej: Centro, Calle 123"
              />
            </Field>

            <Checkbox
              label="Todo el dia"
              checked={allDay}
              onChange={(_, d) => setAllDay(Boolean(d.checked))}
            />

            <div className={styles.row}>
              <Field label="Inicio" className={styles.grow}>
                <Input
                  type={inputType}
                  value={format(start, fmt)}
                  onChange={(_, d) => {
                    const nd = parseLocal(d.value, allDay);
                    if (nd) setStart(nd);
                  }}
                />
              </Field>
              <Field label="Fin" className={styles.grow}>
                <Input
                  type={inputType}
                  value={format(end, fmt)}
                  onChange={(_, d) => {
                    const nd = parseLocal(d.value, allDay);
                    if (nd) setEnd(nd);
                  }}
                />
              </Field>
            </div>

            <Field label="Recordatorios">
              <Dropdown
                multiselect
                placeholder="Sin recordatorio"
                selectedOptions={reminders.map(String)}
                value={reminders.length ? reminders.map(reminderLabel).join(', ') : ''}
                onOptionSelect={(_, data) =>
                  setReminders(data.selectedOptions.map(Number).sort((a, b) => a - b))
                }
              >
                {REMINDER_OPTIONS.map((m) => (
                  <Option key={m} value={String(m)} text={reminderLabel(m)}>
                    {reminderLabel(m)}
                  </Option>
                ))}
              </Dropdown>
            </Field>

            {allowRecurrence && (
              <div className={styles.row}>
                <Field label="Repetir" className={styles.grow}>
                  <Dropdown
                    value={RECUR_LABELS[recurFreq]}
                    selectedOptions={[recurFreq]}
                    onOptionSelect={(_, d) =>
                      setRecurFreq((d.optionValue as 'none' | RecurrenceFreq) ?? 'none')
                    }
                  >
                    <Option value="none" text="No se repite">
                      No se repite
                    </Option>
                    <Option value="daily" text="Cada dia">
                      Cada dia
                    </Option>
                    <Option value="weekly" text="Cada semana">
                      Cada semana
                    </Option>
                    <Option value="monthly" text="Cada mes">
                      Cada mes
                    </Option>
                  </Dropdown>
                </Field>
                {recurFreq !== 'none' && (
                  <Field label="Repetir hasta (opcional)" className={styles.grow}>
                    <Input
                      type="date"
                      value={recurUntil}
                      onChange={(_, d) => setRecurUntil(d.value)}
                    />
                  </Field>
                )}
              </div>
            )}

            <Field label="Notas">
              <Textarea
                value={description}
                onChange={(_, d) => setDescription(d.value)}
                placeholder="Detalles, que llevar, reservas..."
                resize="vertical"
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button appearance="primary" onClick={submit} disabled={busy}>
              {busy ? 'Guardando...' : submitLabel ?? (isEdit ? 'Guardar cambios' : 'Crear actividad')}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
