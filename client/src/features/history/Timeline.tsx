import { Text, Spinner, makeStyles, tokens } from '@fluentui/react-components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, Category } from '../../types';
import { StarRating } from '../memories/StarRating';

const useStyles = makeStyles({
  empty: { color: tokens.colorNeutralForeground3, textAlign: 'center', padding: '32px' },
  timeline: { display: 'flex', flexDirection: 'column' },
  row: { display: 'flex', gap: '10px', alignItems: 'stretch' },
  dateCol: { width: '78px', flexShrink: 0, textAlign: 'right', paddingTop: '2px' },
  year: { fontWeight: 700, fontSize: '15px' },
  day: { fontSize: '12px', color: tokens.colorNeutralForeground3, textTransform: 'capitalize' },
  lineCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '16px', flexShrink: 0 },
  dot: { width: '12px', height: '12px', borderRadius: '50%', marginTop: '5px', flexShrink: 0 },
  line: { flexGrow: 1, width: '2px', backgroundColor: tokens.colorNeutralStroke2 },
  content: { flexGrow: 1, paddingBottom: '18px', display: 'flex', gap: '10px', minWidth: 0 },
  thumb: { width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
  body: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  title: { fontWeight: tokens.fontWeightSemibold },
  notes: { color: tokens.colorNeutralForeground2, whiteSpace: 'pre-wrap' },
});

interface Props {
  memories: Activity[];
  categories: Category[];
  loading?: boolean;
}

export function Timeline({ memories, categories, loading }: Props) {
  const styles = useStyles();

  if (loading) return <Spinner label="Cargando recuerdos..." />;
  if (memories.length === 0) {
    return (
      <div className={styles.empty}>
        Aun no hay recuerdos en la linea de tiempo. Marca actividades como vividas para
        construir vuestra historia.
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {memories.map((m, i) => {
        const cat = categories.find((c) => c._id === m.categoryId);
        const start = new Date(m.start);
        const photo = m.memory?.photos?.[0];
        return (
          <div className={styles.row} key={m._id}>
            <div className={styles.dateCol}>
              <div className={styles.year}>{format(start, 'yyyy')}</div>
              <div className={styles.day}>{format(start, 'd MMM', { locale: es })}</div>
            </div>
            <div className={styles.lineCol}>
              <span className={styles.dot} style={{ backgroundColor: m.color }} />
              {i < memories.length - 1 && <span className={styles.line} />}
            </div>
            <div className={styles.content}>
              {photo && <img className={styles.thumb} src={photo} alt="Recuerdo" />}
              <div className={styles.body}>
                <Text className={styles.title}>
                  {cat ? `${cat.icon} ` : ''}
                  {m.title}
                </Text>
                {m.memory?.rating ? <StarRating value={m.memory.rating} size={16} /> : null}
                {m.memory?.notes && <Text className={styles.notes}>{m.memory.notes}</Text>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
