import { useState } from 'react';
import {
  Button,
  Text,
  Title3,
  Caption1,
  Spinner,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Dismiss24Regular, Edit16Regular, Heart24Filled } from '@fluentui/react-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, Category } from '../../types';
import { StarRating } from './StarRating';

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
  },
  panel: {
    width: '100%',
    maxWidth: '1080px',
    height: '90vh',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '12px',
    boxShadow: tokens.shadow64,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorBrandForeground1,
  },
  grow: { flexGrow: 1 },
  body: { flexGrow: 1, overflowY: 'auto', padding: '20px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  },
  card: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'column',
    ':hover': { boxShadow: tokens.shadow8 },
  },
  cover: {
    height: '150px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'grid',
    placeItems: 'center',
    fontSize: '40px',
    color: '#fff',
  },
  coverClickable: { cursor: 'zoom-in' },
  cardBody: { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' },
  titleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
  notes: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    color: tokens.colorNeutralForeground2,
  },
  empty: {
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
  lightbox: {
    position: 'fixed',
    inset: 0,
    zIndex: 1100,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'grid',
    placeItems: 'center',
    cursor: 'zoom-out',
    padding: '24px',
  },
  lightboxImg: { maxWidth: '92vw', maxHeight: '92vh', borderRadius: '8px' },
});

interface Props {
  open: boolean;
  memories: Activity[];
  categories: Category[];
  loading?: boolean;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
}

export function MemoriesGallery({ open, memories, categories, loading, onClose, onEdit }: Props) {
  const styles = useStyles();
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <Heart24Filled />
          <Title3 className={styles.grow}>Recuerdos</Title3>
          <Tooltip content="Cerrar" relationship="label">
            <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />
          </Tooltip>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.empty}>
              <Spinner label="Cargando recuerdos..." />
            </div>
          ) : memories.length === 0 ? (
            <div className={styles.empty}>
              <div>
                <Heart24Filled />
                <Text as="p">
                  Aun no hay recuerdos. Marca una actividad vivida como recuerdo para guardarla aqui.
                </Text>
              </div>
            </div>
          ) : (
            <div className={styles.grid}>
              {memories.map((m) => {
                const category = categories.find((c) => c._id === m.categoryId);
                const cover = m.memory?.photos?.[0];
                return (
                  <div key={m._id} className={styles.card}>
                    <div
                      className={`${styles.cover} ${cover ? styles.coverClickable : ''}`}
                      style={
                        cover
                          ? { backgroundImage: `url(${cover})` }
                          : { background: `linear-gradient(135deg, ${m.color} 0%, ${m.color}aa 100%)` }
                      }
                      onClick={() => cover && setLightbox(cover)}
                    >
                      {!cover && (category?.icon ?? '💛')}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.titleRow}>
                        <Text weight="semibold">{m.title}</Text>
                        <Tooltip content="Editar recuerdo" relationship="label">
                          <Button
                            size="small"
                            appearance="subtle"
                            icon={<Edit16Regular />}
                            onClick={() => onEdit(m)}
                          />
                        </Tooltip>
                      </div>
                      <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                        {format(new Date(m.start), "d 'de' MMMM yyyy", { locale: es })}
                      </Caption1>
                      {m.memory?.rating ? (
                        <StarRating value={m.memory.rating} size={16} />
                      ) : null}
                      {m.memory?.notes && <Text className={styles.notes}>{m.memory.notes}</Text>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <img className={styles.lightboxImg} src={lightbox} alt="Recuerdo" />
        </div>
      )}
    </div>
  );
}
