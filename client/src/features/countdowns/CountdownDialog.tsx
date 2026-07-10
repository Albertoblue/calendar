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
  Checkbox,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { format } from 'date-fns';
import { Countdown, CountdownInput } from '../../types';

const ICONS = ['❤️', '🎉', '✈️', '🎂', '💍', '🥂', '🌹', '⭐', '🏖️', '🎄'];
const COLORS = ['#E3008C', '#D13438', '#0F6CBD', '#8764B8', '#CA5010', '#107C10'];

const useStyles = makeStyles({
  content: { display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '380px' },
  swatches: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  emoji: {
    fontSize: '20px',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    background: tokens.colorNeutralBackground1,
    cursor: 'pointer',
    lineHeight: '36px',
    textAlign: 'center',
  },
  emojiActive: { outline: `2px solid ${tokens.colorBrandStroke1}`, outlineOffset: '1px' },
  color: { width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', border: `2px solid ${tokens.colorNeutralStroke1}` },
  colorActive: { outline: `2px solid ${tokens.colorBrandStroke1}`, outlineOffset: '2px' },
});

interface Props {
  open: boolean;
  onClose: () => void;
  countdown?: Countdown | null;
  onSubmit: (input: CountdownInput, id?: string) => void;
  busy?: boolean;
}

export function CountdownDialog({ open, onClose, countdown, onSubmit, busy }: Props) {
  const styles = useStyles();
  const isEdit = Boolean(countdown);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setTitle(countdown?.title ?? '');
    setDate(countdown ? format(new Date(countdown.date), 'yyyy-MM-dd') : '');
    setIcon(countdown?.icon ?? ICONS[0]);
    setColor(countdown?.color ?? COLORS[0]);
    setRecurring(countdown?.recurring ?? false);
  }, [open, countdown]);

  const submit = () => {
    if (!title.trim()) {
      setError('El titulo es obligatorio.');
      return;
    }
    if (!date) {
      setError('La fecha es obligatoria.');
      return;
    }
    onSubmit(
      {
        title: title.trim(),
        date: new Date(`${date}T12:00:00`).toISOString(),
        icon,
        color,
        recurring,
      },
      countdown?._id
    );
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{isEdit ? 'Editar fecha' : 'Nueva fecha clave'}</DialogTitle>
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
                placeholder="Ej: Nuestro aniversario"
              />
            </Field>

            <Field label="Fecha" required>
              <Input type="date" value={date} onChange={(_, d) => setDate(d.value)} />
            </Field>

            <Checkbox
              label="Se repite cada ano (aniversario, cumpleanos)"
              checked={recurring}
              onChange={(_, d) => setRecurring(Boolean(d.checked))}
            />

            <Field label="Icono">
              <div className={styles.swatches}>
                {ICONS.map((e) => (
                  <div
                    key={e}
                    className={`${styles.emoji} ${icon === e ? styles.emojiActive : ''}`}
                    onClick={() => setIcon(e)}
                    role="button"
                  >
                    {e}
                  </div>
                ))}
              </div>
            </Field>

            <Field label="Color">
              <div className={styles.swatches}>
                {COLORS.map((c) => (
                  <div
                    key={c}
                    className={`${styles.color} ${color === c ? styles.colorActive : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    role="button"
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button appearance="primary" onClick={submit} disabled={busy}>
              {busy ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear fecha'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
