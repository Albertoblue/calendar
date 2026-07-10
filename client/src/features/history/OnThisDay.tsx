import { Text, Caption1, Spinner, makeStyles, tokens } from '@fluentui/react-components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, Category } from '../../types';
import { StarRating } from '../memories/StarRating';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: '14px' },
  empty: { color: tokens.colorNeutralForeground3, textAlign: 'center', padding: '32px' },
  card: {
    display: 'flex',
    gap: '12px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  cover: { width: '110px', flexShrink: 0, backgroundSize: 'cover', backgroundPosition: 'center', display: 'grid', placeItems: 'center', fontSize: '28px', color: '#fff' },
  body: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, minWidth: 0 },
  ago: { color: tokens.colorBrandForeground1, fontWeight: tokens.fontWeightSemibold },
  title: { fontWeight: tokens.fontWeightSemibold },
  notes: { color: tokens.colorNeutralForeground2, whiteSpace: 'pre-wrap' },
});

interface Props {
  activities: Activity[];
  categories: Category[];
  loading?: boolean;
}

export function OnThisDay({ activities, categories, loading }: Props) {
  const styles = useStyles();
  const nowYear = new Date().getFullYear();

  if (loading) return <Spinner label="Buscando recuerdos de hoy..." />;
  if (activities.length === 0) {
    return (
      <div className={styles.empty}>
        Un dia como hoy todavia no tiene recuerdos guardados. ¡A crearlos! 💛
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {activities.map((a) => {
        const cat = categories.find((c) => c._id === a.categoryId);
        const start = new Date(a.start);
        const years = nowYear - start.getFullYear();
        const photo = a.memory?.photos?.[0];
        return (
          <div className={styles.card} key={a._id}>
            <div
              className={styles.cover}
              style={
                photo
                  ? { backgroundImage: `url(${photo})` }
                  : { background: `linear-gradient(135deg, ${a.color} 0%, ${a.color}aa 100%)` }
              }
            >
              {!photo && (cat?.icon ?? '💛')}
            </div>
            <div className={styles.body}>
              <Caption1 className={styles.ago}>
                {years === 1 ? 'Hace 1 ano' : `Hace ${years} anos`} ·{' '}
                {format(start, "d 'de' MMMM yyyy", { locale: es })}
              </Caption1>
              <Text className={styles.title}>{a.title}</Text>
              {a.memory?.rating ? <StarRating value={a.memory.rating} size={16} /> : null}
              {a.memory?.notes && <Text className={styles.notes}>{a.memory.notes}</Text>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
