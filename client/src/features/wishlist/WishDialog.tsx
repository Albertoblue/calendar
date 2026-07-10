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
  MessageBar,
  MessageBarBody,
  makeStyles,
} from '@fluentui/react-components';
import { Category, WishInput, WishPriority, WishlistItem } from '../../types';

const useStyles = makeStyles({
  content: { display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '380px' },
  row: { display: 'flex', gap: '12px' },
  grow: { flexGrow: 1 },
});

const PRIORITY_LABELS: Record<WishPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  wish?: WishlistItem | null;
  onSubmit: (input: WishInput, id?: string) => void;
  busy?: boolean;
}

export function WishDialog({ open, onClose, categories, wish, onSubmit, busy }: Props) {
  const styles = useStyles();
  const isEdit = Boolean(wish);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [color, setColor] = useState('#0F6CBD');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<WishPriority>('medium');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setTitle(wish?.title ?? '');
    setCategoryId(wish?.categoryId ?? null);
    setColor(wish?.color ?? '#0F6CBD');
    setLocation(wish?.location ?? '');
    setPriority(wish?.priority ?? 'medium');
    setDescription(wish?.description ?? '');
  }, [open, wish]);

  const selectedCategory = categories.find((c) => c._id === categoryId);

  const submit = () => {
    if (!title.trim()) {
      setError('El titulo es obligatorio.');
      return;
    }
    onSubmit(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        categoryId: categoryId || null,
        color,
        priority,
      },
      wish?._id
    );
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{isEdit ? 'Editar deseo' : 'Nuevo deseo'}</DialogTitle>
          <DialogContent className={styles.content}>
            {error && (
              <MessageBar intent="error">
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}

            <Field label="Que quieren hacer" required>
              <Input
                value={title}
                onChange={(_, d) => setTitle(d.value)}
                placeholder="Ej: Ir a ver auroras boreales"
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
              <Field label="Prioridad">
                <Dropdown
                  value={PRIORITY_LABELS[priority]}
                  selectedOptions={[priority]}
                  onOptionSelect={(_, data) =>
                    setPriority((data.optionValue as WishPriority) ?? 'medium')
                  }
                >
                  <Option value="high" text="Alta">
                    Alta
                  </Option>
                  <Option value="medium" text="Media">
                    Media
                  </Option>
                  <Option value="low" text="Baja">
                    Baja
                  </Option>
                </Dropdown>
              </Field>
            </div>

            <Field label="Lugar (opcional)">
              <Input
                value={location}
                onChange={(_, d) => setLocation(d.value)}
                placeholder="Ej: Islandia"
              />
            </Field>

            <Field label="Notas">
              <Textarea
                value={description}
                onChange={(_, d) => setDescription(d.value)}
                placeholder="Ideas, enlaces, presupuesto..."
                resize="vertical"
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button appearance="primary" onClick={submit} disabled={busy}>
              {busy ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Anadir a la lista'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
