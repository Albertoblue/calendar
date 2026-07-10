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
  Textarea,
  Text,
  Caption1,
  Spinner,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ImageAdd24Regular, Dismiss16Filled } from '@fluentui/react-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, Memory } from '../../types';
import { StarRating } from './StarRating';
import { fileToDataUrl } from '../../lib/image';

const MAX_PHOTOS = 6;

const useStyles = makeStyles({
  content: { display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '420px' },
  sub: { color: tokens.colorNeutralForeground3 },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  thumb: {
    position: 'relative',
    width: '84px',
    height: '84px',
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
  uploading: { display: 'flex', alignItems: 'center', gap: '8px' },
});

interface Props {
  open: boolean;
  activity: Activity | null;
  onClose: () => void;
  onSave: (id: string, memory: Memory) => void;
  busy?: boolean;
}

export function MemoryDialog({ open, activity, onClose, onSave, busy }: Props) {
  const styles = useStyles();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setUploading(false);
    setRating(activity?.memory?.rating ?? 0);
    setNotes(activity?.memory?.notes ?? '');
    setPhotos(activity?.memory?.photos ?? []);
  }, [open, activity]);

  if (!activity) return null;

  const addFiles = async (files: FileList) => {
    setError('');
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setError(`Maximo ${MAX_PHOTOS} fotos por recuerdo.`);
      return;
    }
    const list = Array.from(files).slice(0, room);
    setUploading(true);
    try {
      const urls = await Promise.all(list.map((f) => fileToDataUrl(f)));
      setPhotos((prev) => [...prev, ...urls]);
    } catch {
      setError('No se pudieron procesar algunas fotos.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const save = () =>
    onSave(activity._id, {
      rating: rating || undefined,
      notes: notes.trim() || undefined,
      photos,
    });

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Recuerdo</DialogTitle>
          <DialogContent className={styles.content}>
            <div>
              <Text weight="semibold">{activity.title}</Text>
              <br />
              <Caption1 className={styles.sub}>
                {format(new Date(activity.start), "d 'de' MMMM yyyy", { locale: es })}
              </Caption1>
            </div>

            {error && (
              <MessageBar intent="error">
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}

            <Field label="Que tal estuvo?">
              <StarRating value={rating} onChange={setRating} />
            </Field>

            <Field label="Notas del recuerdo">
              <Textarea
                value={notes}
                onChange={(_, d) => setNotes(d.value)}
                placeholder="Que hicieron, que les gusto, anecdotas..."
                resize="vertical"
              />
            </Field>

            <Field label={`Fotos (${photos.length}/${MAX_PHOTOS})`}>
              <div className={styles.grid}>
                {photos.map((src, i) => (
                  <div key={i} className={styles.thumb} style={{ backgroundImage: `url(${src})` }}>
                    <Button
                      size="small"
                      appearance="subtle"
                      className={styles.remove}
                      icon={<Dismiss16Filled />}
                      onClick={() => removePhoto(i)}
                      aria-label="Quitar foto"
                    />
                  </div>
                ))}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
              {uploading ? (
                <div className={styles.uploading}>
                  <Spinner size="tiny" /> <Text>Procesando fotos...</Text>
                </div>
              ) : (
                <Button
                  icon={<ImageAdd24Regular />}
                  onClick={() => fileRef.current?.click()}
                  disabled={photos.length >= MAX_PHOTOS}
                >
                  Anadir fotos
                </Button>
              )}
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button appearance="primary" onClick={save} disabled={busy || uploading}>
              {busy ? 'Guardando...' : 'Guardar recuerdo'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
