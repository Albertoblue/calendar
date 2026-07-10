import {
  Button,
  Input,
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Add16Filled,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronDown16Regular,
  Search20Regular,
  Settings20Regular,
  QuestionCircle20Regular,
  SignOut20Regular,
  GridDots20Regular,
  CalendarLtr20Regular,
  Star20Regular,
  Star20Filled,
  Heart20Regular,
  Lightbulb20Regular,
  CalendarClock20Regular,
  Sparkle20Regular,
  History20Regular,
  Gift20Regular,
} from '@fluentui/react-icons';
import { View } from 'react-big-calendar';
import {
  format,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity } from '../../types';
import { NotificationsBell } from '../reminders/NotificationsBell';

const OUTLOOK_BLUE = '#0F6CBD';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column' },
  topbar: {
    height: '48px',
    backgroundColor: OUTLOOK_BLUE,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 12px',
    color: '#fff',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '16px' },
  search: { flexGrow: 1, maxWidth: '480px' },
  spacer: { flexGrow: 1 },
  iconBtn: { color: '#fff', minWidth: '32px' },
  commandbar: {
    height: '48px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 12px',
  },
  dateLabel: {
    fontSize: '18px',
    fontWeight: tokens.fontWeightSemibold,
    textTransform: 'capitalize',
    marginLeft: '4px',
    whiteSpace: 'nowrap',
  },
});

const VIEW_LABELS: Record<string, string> = {
  day: 'Dia',
  week: 'Semana',
  month: 'Mes',
  agenda: 'Agenda',
};

interface Props {
  userName: string;
  view: View;
  date: Date;
  wishlistOpen: boolean;
  upcomingActivities: Activity[];
  onNewActivity: () => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (view: View) => void;
  onToggleWishlist: () => void;
  onOpenMemories: () => void;
  onOpenIdeas: () => void;
  onOpenCountdowns: () => void;
  onOpenSuggest: () => void;
  onOpenHistory: () => void;
  onOpenGifts: () => void;
  onLogout: () => void;
}

function dateLabel(date: Date, view: View): string {
  if (view === 'day') return format(date, "EEEE d 'de' MMMM yyyy", { locale: es });
  if (view === 'week') {
    const from = startOfWeek(date, { weekStartsOn: 0 });
    const to = endOfWeek(date, { weekStartsOn: 0 });
    return `${format(from, 'd MMM', { locale: es })} - ${format(to, 'd MMM yyyy', { locale: es })}`;
  }
  return format(date, 'MMMM yyyy', { locale: es });
}

export function TopBar({
  userName,
  view,
  date,
  wishlistOpen,
  upcomingActivities,
  onNewActivity,
  onToday,
  onPrev,
  onNext,
  onViewChange,
  onToggleWishlist,
  onOpenMemories,
  onOpenIdeas,
  onOpenCountdowns,
  onOpenSuggest,
  onOpenHistory,
  onOpenGifts,
  onLogout,
}: Props) {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.topbar}>
        <Button appearance="transparent" className={styles.iconBtn} icon={<GridDots20Regular />} />
        <div className={styles.brand}>
          <CalendarLtr20Regular />
          Nuestro Calendario
        </div>
        <div className={styles.search}>
          <Input
            contentBefore={<Search20Regular />}
            placeholder="Buscar"
            appearance="filled-lighter"
            style={{ width: '100%' }}
          />
        </div>
        <div className={styles.spacer} />
        <NotificationsBell activities={upcomingActivities} />
        <Button appearance="transparent" className={styles.iconBtn} icon={<Settings20Regular />} />
        <Button appearance="transparent" className={styles.iconBtn} icon={<QuestionCircle20Regular />} />
        <Avatar name={userName} color="colorful" size={32} />
      </div>

      <div className={styles.commandbar}>
        <Button appearance="primary" icon={<Add16Filled />} onClick={onNewActivity}>
          Nueva actividad
        </Button>
        <Button appearance="subtle" onClick={onToday}>
          Hoy
        </Button>
        <Tooltip content="Anterior" relationship="label">
          <Button appearance="subtle" icon={<ChevronLeft20Regular />} onClick={onPrev} />
        </Tooltip>
        <Tooltip content="Siguiente" relationship="label">
          <Button appearance="subtle" icon={<ChevronRight20Regular />} onClick={onNext} />
        </Tooltip>
        <span className={styles.dateLabel}>{dateLabel(date, view)}</span>

        <div className={styles.spacer} />

        <Button
          appearance={wishlistOpen ? 'primary' : 'subtle'}
          icon={wishlistOpen ? <Star20Filled /> : <Star20Regular />}
          onClick={onToggleWishlist}
        >
          Lista de deseos
        </Button>

        <Button appearance="subtle" icon={<Heart20Regular />} onClick={onOpenMemories}>
          Recuerdos
        </Button>

        <Button appearance="subtle" icon={<Lightbulb20Regular />} onClick={onOpenIdeas}>
          Ideas
        </Button>

        <Button appearance="subtle" icon={<CalendarClock20Regular />} onClick={onOpenCountdowns}>
          Fechas
        </Button>

        <Button appearance="subtle" icon={<Sparkle20Regular />} onClick={onOpenSuggest}>
          Sugerir
        </Button>

        <Button appearance="subtle" icon={<History20Regular />} onClick={onOpenHistory}>
          Historia
        </Button>

        <Button appearance="subtle" icon={<Gift20Regular />} onClick={onOpenGifts}>
          Regalos
        </Button>

        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button appearance="subtle" iconPosition="after" icon={<ChevronDown16Regular />}>
              {VIEW_LABELS[view] ?? 'Vista'}
            </Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem onClick={() => onViewChange('day')}>Dia</MenuItem>
              <MenuItem onClick={() => onViewChange('week')}>Semana</MenuItem>
              <MenuItem onClick={() => onViewChange('month')}>Mes</MenuItem>
              <MenuItem onClick={() => onViewChange('agenda')}>Agenda</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>

        <Tooltip content="Cerrar sesion" relationship="label">
          <Button appearance="subtle" icon={<SignOut20Regular />} onClick={onLogout} />
        </Tooltip>
      </div>
    </div>
  );
}
