import { Text, Caption1, Spinner, makeStyles, tokens } from '@fluentui/react-components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Stats } from '../../types';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: '20px' },
  tiles: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' },
  tile: {
    borderRadius: '10px',
    padding: '14px',
    color: '#fff',
    background: 'linear-gradient(135deg, #0F6CBD 0%, #6E48AA 100%)',
  },
  tileNum: { fontSize: '28px', fontWeight: 700, lineHeight: 1 },
  tileLabel: { opacity: 0.95, fontSize: '13px' },
  section: { display: 'flex', flexDirection: 'column', gap: '6px' },
  sectionTitle: { color: tokens.colorNeutralForeground3, textTransform: 'uppercase', letterSpacing: '0.4px' },
  barRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  barLabel: { width: '110px', flexShrink: 0, fontSize: '13px', textAlign: 'right' },
  barTrack: { flexGrow: 1, height: '18px', backgroundColor: tokens.colorNeutralBackground3, borderRadius: '9px', overflow: 'hidden' },
  bar: { height: '100%', borderRadius: '9px', minWidth: '2px' },
  barCount: { width: '32px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  empty: { color: tokens.colorNeutralForeground3, padding: '8px 0' },
});

interface Props {
  stats?: Stats;
  loading?: boolean;
}

function monthLabel(month: string): string {
  const d = new Date(`${month}-01T12:00:00`);
  return Number.isNaN(d.getTime()) ? month : format(d, 'MMM yy', { locale: es });
}

export function StatsView({ stats, loading }: Props) {
  const styles = useStyles();

  if (loading || !stats) {
    return <Spinner label="Calculando estadisticas..." />;
  }

  const maxCat = Math.max(1, ...stats.byCategory.map((c) => c.count));
  const maxMonth = Math.max(1, ...stats.byMonth.map((m) => m.count));

  const tiles = [
    { num: stats.memories, label: 'Recuerdos vividos' },
    { num: stats.totalActivities, label: 'Actividades totales' },
    { num: stats.placesVisited, label: 'Lugares visitados' },
    { num: stats.watchlist, label: 'En la watchlist' },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.tiles}>
        {tiles.map((t) => (
          <div key={t.label} className={styles.tile}>
            <div className={styles.tileNum}>{t.num}</div>
            <div className={styles.tileLabel}>{t.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <Caption1 className={styles.sectionTitle}>Categorias favoritas</Caption1>
        {stats.byCategory.length === 0 ? (
          <Text className={styles.empty}>Aun no hay actividades.</Text>
        ) : (
          stats.byCategory.map((c) => (
            <div key={c.name} className={styles.barRow}>
              <span className={styles.barLabel}>{c.name}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{ width: `${(c.count / maxCat) * 100}%`, backgroundColor: c.color }}
                />
              </div>
              <span className={styles.barCount}>{c.count}</span>
            </div>
          ))
        )}
      </div>

      <div className={styles.section}>
        <Caption1 className={styles.sectionTitle}>Actividades por mes</Caption1>
        {stats.byMonth.length === 0 ? (
          <Text className={styles.empty}>Aun no hay actividades.</Text>
        ) : (
          stats.byMonth.map((m) => (
            <div key={m.month} className={styles.barRow}>
              <span className={styles.barLabel}>{monthLabel(m.month)}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{ width: `${(m.count / maxMonth) * 100}%`, backgroundColor: '#0F6CBD' }}
                />
              </div>
              <span className={styles.barCount}>{m.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
