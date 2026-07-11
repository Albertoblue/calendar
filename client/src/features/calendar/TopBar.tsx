import {
  Button,
  Input,
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
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
  Navigation20Regular,
  MoreHorizontal20Regular,
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
import { useIsMobile } from '../../lib/useIsMobile';

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
    '@media (max-width: 768px)': { gap: '6px', padding: '0 6px' },
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    fontSize: '16px',
    whiteSpace: 'nowrap',
    '@media (max-width: 768px)': { fontSize: '14px' },
  },
  brandText: { '@media (max-width: 480px)': { display: 'none' } },
  search: {
    flexGrow: 1,
    maxWidth: '480px',
    '@media (max-width: 768px)': { display: 'none' },
  },
  spacer: { flexGrow: 1 },
  iconBtn: { color: '#fff', minWidth: '32px' },
  hideMobile: { '@media (max-width: 768px)': { display: 'none' } },
  menuBtn: { color: '#fff', minWidth: '32px' },
  commandbar: {
    height: '48px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 12px',
    overflowX: 'auto',
    '@media (max-width: 768px)': { gap: '4px', padding: '0 6px' },
  },
  dateLabel: {
    fontSize: '18px',
    fontWeight: tokens.fontWeightSemibold,
    textTransform: 'capitalize',
    marginLeft: '4px',
    whiteSpace: 'nowrap',
    '@media (max-width: 768px)': { fontSize: '13px', marginLeft: '2px' },
  },
  viewGroup: {
    display: 'flex',
    gap: '2px',
    marginLeft: '8px',
    padding: '2px',
    borderRadius: '6px',
    backgroundColor: tokens.colorNeutralBackground3,
    flexShrink: 0,
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
  onToggleSidebar: () => void;
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
  onToggleSidebar,
  onLogout,
}: Props) {
  const styles = useStyles();
  const isMobile = useIsMobile();

  const viewMenu = (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button appearance="subtle" iconPosition="after" icon={<ChevronDown16Regular />}>
          {VIEW_LABELS[view] ?? 'Vista'}
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem onClick={() => onViewChange('month')}>Mes</MenuItem>
          <MenuItem onClick={() => onViewChange('week')}>Semana</MenuItem>
          <MenuItem onClick={() => onViewChange('day')}>Dia</MenuItem>
          <MenuItem onClick={() => onViewChange('agenda')}>Agenda</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );

  // Selector de vista segmentado (escritorio): Mes / Semana / Dia / Agenda a la vista.
  const viewButtons = (
    <div className={styles.viewGroup}>
      {(['month', 'week', 'day', 'agenda'] as View[]).map((v) => (
        <Button
          key={v}
          size="small"
          appearance={view === v ? 'primary' : 'subtle'}
          onClick={() => onViewChange(v)}
        >
          {VIEW_LABELS[v]}
        </Button>
      ))}
    </div>
  );

  return (
    <div className={styles.root}>
      <div className={styles.topbar}>
        <Button
          appearance="transparent"
          className={styles.menuBtn}
          icon={<Navigation20Regular />}
          onClick={onToggleSidebar}
          aria-label="Mostrar u ocultar el panel lateral"
          title="Mostrar u ocultar el panel"
        />
        <div className={styles.brand}>
          <CalendarLtr20Regular />
          <span className={styles.brandText}>Nuestro Calendario</span>
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
        <Button
          appearance="transparent"
          className={`${styles.iconBtn} ${styles.hideMobile}`}
          icon={<Settings20Regular />}
        />
        <Button
          appearance="transparent"
          className={`${styles.iconBtn} ${styles.hideMobile}`}
          icon={<QuestionCircle20Regular />}
        />
        <Avatar name={userName} color="colorful" size={32} />
      </div>

      <div className={styles.commandbar}>
        <Button appearance="primary" icon={<Add16Filled />} onClick={onNewActivity}>
          {isMobile ? null : 'Nueva actividad'}
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

        {!isMobile && viewButtons}

        <div className={styles.spacer} />

        {isMobile ? (
          <>
            {viewMenu}
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label="Mas opciones" />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem
                    icon={wishlistOpen ? <Star20Filled /> : <Star20Regular />}
                    onClick={onToggleWishlist}
                  >
                    Lista de deseos
                  </MenuItem>
                  <MenuItem icon={<Heart20Regular />} onClick={onOpenMemories}>
                    Recuerdos
                  </MenuItem>
                  <MenuItem icon={<Lightbulb20Regular />} onClick={onOpenIdeas}>
                    Ideas
                  </MenuItem>
                  <MenuItem icon={<CalendarClock20Regular />} onClick={onOpenCountdowns}>
                    Fechas
                  </MenuItem>
                  <MenuItem icon={<Sparkle20Regular />} onClick={onOpenSuggest}>
                    Sugerir
                  </MenuItem>
                  <MenuItem icon={<History20Regular />} onClick={onOpenHistory}>
                    Historia
                  </MenuItem>
                  <MenuItem icon={<Gift20Regular />} onClick={onOpenGifts}>
                    Regalos
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<SignOut20Regular />} onClick={onLogout}>
                    Cerrar sesion
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </>
        ) : (
          <>
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

            <Tooltip content="Cerrar sesion" relationship="label">
              <Button appearance="subtle" icon={<SignOut20Regular />} onClick={onLogout} />
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
}
