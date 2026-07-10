import {
  Button,
  Text,
  Title3,
  Spinner,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Dismiss24Regular, Add20Filled, Edit16Regular, Delete16Regular } from '@fluentui/react-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Countdown } from '../../types';
import { daysUntil, nextOccurrence, anniversaryNumber, countdownLabel, sortByProximity } from '../../lib/countdown';

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
    maxWidth: '960px',
    height: '88vh',
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
    padding: '14px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorBrandForeground1,
  },
  grow: { flexGrow: 1 },
  body: { flexGrow: 1, overflowY: 'auto', padding: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  card: {
    position: 'relative',
    borderRadius: '14px',
    padding: '20px',
    color: '#fff',
    minHeight: '150px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: tokens.shadow8,
  },
  icon: { fontSize: '32px' },
  days: { fontSize: '40px', fontWeight: 700, lineHeight: 1.1 },
  cardTitle: { fontSize: '18px', fontWeight: 600 },
  meta: { opacity: 0.9, fontSize: '13px' },
  actions: { position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '2px' },
  whiteBtn: { color: '#fff' },
  empty: { height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

interface Props {
  open: boolean;
  countdowns: Countdown[];
  loading?: boolean;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (c: Countdown) => void;
  onDelete: (id: string) => void;
}

export function CountdownsPanel({ open, countdowns, loading, onClose, onAdd, onEdit, onDelete }: Props) {
  const styles = useStyles();
  if (!open) return null;

  const sorted = sortByProximity(countdowns);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span style={{ fontSize: '22px' }}>⏳</span>
          <Title3 className={styles.grow}>Fechas clave</Title3>
          <Button appearance="primary" icon={<Add20Filled />} onClick={onAdd}>
            Nueva fecha
          </Button>
          <Tooltip content="Cerrar" relationship="label">
            <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />
          </Tooltip>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.empty}>
              <Spinner label="Cargando..." />
            </div>
          ) : sorted.length === 0 ? (
            <div className={styles.empty}>
              <Text as="p">
                Aun no hay fechas. Anade vuestro aniversario, un viaje o un cumpleanos.
              </Text>
            </div>
          ) : (
            <div className={styles.grid}>
              {sorted.map((c) => {
                const days = daysUntil(c);
                const anniversary = anniversaryNumber(c);
                return (
                  <div
                    key={c._id}
                    className={styles.card}
                    style={{ background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}bb 100%)` }}
                  >
                    <div className={styles.actions}>
                      <Button
                        size="small"
                        appearance="transparent"
                        className={styles.whiteBtn}
                        icon={<Edit16Regular />}
                        onClick={() => onEdit(c)}
                        aria-label="Editar"
                      />
                      <Button
                        size="small"
                        appearance="transparent"
                        className={styles.whiteBtn}
                        icon={<Delete16Regular />}
                        onClick={() => onDelete(c._id)}
                        aria-label="Eliminar"
                      />
                    </div>
                    <div className={styles.icon}>{c.icon}</div>
                    <div>
                      <div className={styles.days}>{countdownLabel(days)}</div>
                      <div className={styles.cardTitle}>{c.title}</div>
                      <div className={styles.meta}>
                        {format(nextOccurrence(c), "EEEE d 'de' MMMM yyyy", { locale: es })}
                        {anniversary ? ` · ${anniversary}º aniversario` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
