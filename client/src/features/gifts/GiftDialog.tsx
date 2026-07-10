import { useEffect, useRef, useState } from 'react';
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
  Spinner,
  Text,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ImageAdd24Regular, Dismiss16Filled } from '@fluentui/react-icons';
import { Gift, GiftInput, GiftOccasion } from '../../types';
import { fileToDataUrl } from '../../lib/image';

const OCCASIONS: { value: GiftOccasion; label: string }[] = [
  { value: 'birthday', label: '🎂 Cumpleanos' },
  { value: 'christmas', label: '🎄 Navidad' },
  { value: 'other', label: '🎁 Otro' },
];
const PRIORITIES: { value: 'low' | 'medium' | 'high'; label: string }[] = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low', label: 'Baja' },
];

const useStyles = makeStyles({
  content: { display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '420px' },
  row: { display: 'flex', gap: '12px' },
  grow: { flexGrow: 1 },
  thumbWrap: { position: 'relative', width: '96px', height: '96px' },
  thumb: {
    width: '96px',
    height: '96px',
    borderRadius: '8px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  remove: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    minWidth: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
  gift?: Gift | null;
  onSubmit: (input: GiftInput, id?: string) => void;
  busy?: boolean;
}

export function GiftDialog({ open, onClose, gift, onSubmit, busy }: Props) {
  const styles = useStyles();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(gift);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [occasion, setOccasion] = useState<GiftOccasion>('other');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setUploading(false);
    setTitle(gift?.title ?? '');
    setPrice(gift?.price != null ? String(gift.price) : '');
    setUrl(gift?.url ?? '');
    setOccasion(gift?.occasion ?? 'other');
    setPriority(gift?.priority ?? 'medium');
    setNotes(gift?.notes ?? '');
    setImageUrl(gift?.imageUrl);
  }, [open, gift]);

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      setImageUrl(await fileToDataUrl(file, 800, 0.72));
    } catch {
      setError('No se pudo procesar la foto.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = () => {
    if (!title.trim()) {
      setError('El titulo es obligatorio.');
      return;
    }
    const priceNum = price.trim() === '' ? undefined : Number(price);
    onSubmit(
      {
        title: title.trim(),
        price: Number.isFinite(priceNum) ? priceNum : undefined,
        url: url.trim() || undefined,
        imageUrl,
        occasion,
        priority,
        notes: notes.trim() || undefined,
      },
      gift?._id
    );
  };

  const occasionLabel = OCCASIONS.find((o) => o.value === occasion)?.label ?? '';
  const priorityLabel = PRIORITIES.find((p) => p.value === priority)?.label ?? '';

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{isEdit ? 'Editar regalo' : 'Nuevo regalo'}</DialogTitle>
          <DialogContent className={styles.content}>
            {error && (
              <MessageBar intent="error">
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}

            <Field label="Que te gustaria" required>
              <Input
                value={title}
                onChange={(_, d) => setTitle(d.value)}
                placeholder="Ej: Auriculares inalambricos"
              />
            </Field>

            <div className={styles.row}>
              <Field label="Precio aprox. (€)">
                <Input
                  type="number"
                  value={price}
                  onChange={(_, d) => setPrice(d.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="Ocasion" className={styles.grow}>
                <Dropdown
                  value={occasionLabel}
                  selectedOptions={[occasion]}
                  onOptionSelect={(_, d) => setOccasion((d.optionValue as GiftOccasion) ?? 'other')}
                >
                  {OCCASIONS.map((o) => (
                    <Option key={o.value} value={o.value} text={o.label}>
                      {o.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
              <Field label="Prioridad">
                <Dropdown
                  value={priorityLabel}
                  selectedOptions={[priority]}
                  onOptionSelect={(_, d) =>
                    setPriority((d.optionValue as 'low' | 'medium' | 'high') ?? 'medium')
                  }
                >
                  {PRIORITIES.map((p) => (
                    <Option key={p.value} value={p.value} text={p.label}>
                      {p.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
            </div>

            <Field label="Enlace a la tienda (opcional)">
              <Input value={url} onChange={(_, d) => setUrl(d.value)} placeholder="https://..." />
            </Field>

            <Field label="Foto (opcional)">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
              />
              {uploading ? (
                <Spinner size="tiny" label="Procesando..." />
              ) : imageUrl ? (
                <div className={styles.thumbWrap}>
                  <div className={styles.thumb} style={{ backgroundImage: `url(${imageUrl})` }} />
                  <Button
                    size="small"
                    appearance="subtle"
                    className={styles.remove}
                    icon={<Dismiss16Filled />}
                    onClick={() => setImageUrl(undefined)}
                    aria-label="Quitar foto"
                  />
                </div>
              ) : (
                <Button icon={<ImageAdd24Regular />} onClick={() => fileRef.current?.click()}>
                  Anadir foto
                </Button>
              )}
            </Field>

            <Field label="Notas (talla, color, modelo...)">
              <Textarea value={notes} onChange={(_, d) => setNotes(d.value)} resize="vertical" />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button appearance="primary" onClick={submit} disabled={busy || uploading}>
              {busy ? 'Guardando...' : isEdit ? 'Guardar' : 'Anadir'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
