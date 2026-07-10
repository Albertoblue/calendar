import { useEffect, useState } from 'react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { ChevronLeft16Regular, ChevronRight16Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: { userSelect: 'none' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' },
  monthLabel: { fontWeight: tokens.fontWeightSemibold, textTransform: 'capitalize' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' },
  weekday: {
    textAlign: 'center',
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    padding: '2px 0',
  },
  day: {
    aspectRatio: '1',
    display: 'grid',
    placeItems: 'center',
    fontSize: '12px',
    borderRadius: '50%',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: tokens.colorNeutralForeground1,
    ':hover': { backgroundColor: tokens.colorNeutralBackground3 },
  },
  outside: { color: tokens.colorNeutralForeground4 },
  today: { border: `1px solid ${tokens.colorBrandStroke1}` },
  selected: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': { backgroundColor: tokens.colorBrandBackgroundHover },
  },
});

const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export function MiniCalendar({ value, onChange }: Props) {
  const styles = useStyles();
  const [display, setDisplay] = useState(startOfMonth(value));

  // Si el calendario principal salta de mes, el mini-mes lo sigue.
  useEffect(() => {
    setDisplay(startOfMonth(value));
  }, [value]);

  const today = new Date();
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(display), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(display), { weekStartsOn: 0 }),
  });

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Text className={styles.monthLabel}>{format(display, 'MMMM yyyy', { locale: es })}</Text>
        <div>
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronLeft16Regular />}
            onClick={() => setDisplay((d) => subMonths(d, 1))}
            aria-label="Mes anterior"
          />
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronRight16Regular />}
            onClick={() => setDisplay((d) => addMonths(d, 1))}
            aria-label="Mes siguiente"
          />
        </div>
      </div>
      <div className={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} className={styles.weekday}>
            {w}
          </div>
        ))}
        {days.map((day) => {
          const classes = [styles.day];
          if (!isSameMonth(day, display)) classes.push(styles.outside);
          if (isSameDay(day, today)) classes.push(styles.today);
          if (isSameDay(day, value)) classes.push(styles.selected);
          return (
            <button
              key={day.toISOString()}
              className={classes.join(' ')}
              onClick={() => onChange(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
