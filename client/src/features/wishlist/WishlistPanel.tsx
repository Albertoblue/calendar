import {
  Button,
  Badge,
  Text,
  Caption1,
  Checkbox,
  Tooltip,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add16Filled,
  Dismiss20Regular,
  Edit16Regular,
  Delete16Regular,
  CalendarArrowRight16Regular,
  ReOrderDotsVertical20Regular,
  Sparkle20Regular,
} from '@fluentui/react-icons';
import { Category, WishlistItem, WishPriority } from '../../types';

const useStyles = makeStyles({
  root: {
    width: '320px',
    maxWidth: '90vw',
    flexShrink: 0,
    borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  title: { display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, fontWeight: 600 },
  hint: {
    padding: '8px 12px',
    color: tokens.colorNeutralForeground3,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  list: { flexGrow: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' },
  card: {
    display: 'flex',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderLeftWidth: '4px',
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'grab',
    ':hover': { backgroundColor: tokens.colorNeutralBackground2, boxShadow: tokens.shadow4 },
  },
  cardDone: { opacity: 0.55 },
  grip: { color: tokens.colorNeutralForeground4, alignSelf: 'center', flexShrink: 0 },
  body: { flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  wishTitle: { fontWeight: tokens.fontWeightSemibold, wordBreak: 'break-word' },
  wishTitleDone: { textDecoration: 'line-through' },
  badges: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' },
  actions: { display: 'flex', gap: '2px', marginTop: '2px' },
  empty: {
    flexGrow: 1,
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    padding: '24px',
    gap: '8px',
  },
});

const PRIORITY: Record<WishPriority, { label: string; color: 'danger' | 'warning' | 'informative' }> = {
  high: { label: 'Alta', color: 'danger' },
  medium: { label: 'Media', color: 'warning' },
  low: { label: 'Baja', color: 'informative' },
};

interface Props {
  items: WishlistItem[];
  categories: Category[];
  loading?: boolean;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (wish: WishlistItem) => void;
  onDelete: (id: string) => void;
  onSchedule: (wish: WishlistItem) => void;
  onToggleDone: (wish: WishlistItem) => void;
  onDragStart: (wish: WishlistItem) => void;
  onDragEnd: () => void;
}

export function WishlistPanel({
  items,
  categories,
  loading,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  onSchedule,
  onToggleDone,
  onDragStart,
  onDragEnd,
}: Props) {
  const styles = useStyles();

  return (
    <aside className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>
          <Sparkle20Regular />
          Lista de deseos
        </span>
        <Button appearance="primary" size="small" icon={<Add16Filled />} onClick={onAdd}>
          Anadir
        </Button>
        <Tooltip content="Cerrar panel" relationship="label">
          <Button appearance="subtle" size="small" icon={<Dismiss20Regular />} onClick={onClose} />
        </Tooltip>
      </div>

      <div className={styles.hint}>
        <Caption1>Arrastra un deseo a un hueco del calendario para agendarlo 📅</Caption1>
      </div>

      {loading ? (
        <div className={styles.empty}>
          <Spinner size="small" label="Cargando..." />
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <Sparkle20Regular />
          <Text>Aun no hay deseos. Anade eso que sueñan hacer juntos.</Text>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((wish) => {
            const category = categories.find((c) => c._id === wish.categoryId);
            const prio = PRIORITY[wish.priority];
            return (
              <div
                key={wish._id}
                className={`${styles.card} ${wish.done ? styles.cardDone : ''}`}
                style={{ borderLeftColor: wish.color }}
                draggable={!wish.done}
                onDragStart={() => onDragStart(wish)}
                onDragEnd={onDragEnd}
              >
                <ReOrderDotsVertical20Regular className={styles.grip} />
                <div className={styles.body}>
                  <div className={styles.titleRow}>
                    <Checkbox
                      checked={wish.done}
                      onChange={() => onToggleDone(wish)}
                      title="Marcar como cumplido"
                    />
                    <span
                      className={`${styles.wishTitle} ${wish.done ? styles.wishTitleDone : ''}`}
                    >
                      {category ? `${category.icon} ` : ''}
                      {wish.title}
                    </span>
                  </div>

                  <div className={styles.badges}>
                    <Badge appearance="tint" color={prio.color} size="small">
                      {prio.label}
                    </Badge>
                    {category && (
                      <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                        {category.name}
                      </Caption1>
                    )}
                    {wish.location && (
                      <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                        · {wish.location}
                      </Caption1>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <Tooltip content="Agendar en el calendario" relationship="label">
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<CalendarArrowRight16Regular />}
                        onClick={() => onSchedule(wish)}
                      >
                        Agendar
                      </Button>
                    </Tooltip>
                    <Tooltip content="Editar" relationship="label">
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Edit16Regular />}
                        onClick={() => onEdit(wish)}
                      />
                    </Tooltip>
                    <Tooltip content="Eliminar" relationship="label">
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Delete16Regular />}
                        onClick={() => onDelete(wish._id)}
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
