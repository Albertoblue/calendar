import { useState } from 'react';
import {
  Checkbox,
  Text,
  Button,
  Caption1,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Copy16Regular, Checkmark16Regular } from '@fluentui/react-icons';
import { MiniCalendar } from './MiniCalendar';
import { SpaceMember, Category, Countdown } from '../../types';
import { daysUntil, countdownLabel } from '../../lib/countdown';

// Paleta de colores bien diferenciados para elegir el color de una categoria.
const PALETTE = [
  '#D13438',
  '#F7630C',
  '#EAA300',
  '#107C10',
  '#038387',
  '#0F6CBD',
  '#8764B8',
  '#E3008C',
  '#5C6773',
  '#8E562E',
];

const useStyles = makeStyles({
  root: {
    width: '260px',
    maxWidth: '85vw',
    flexShrink: 0,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  section: { display: 'flex', flexDirection: 'column', gap: '4px' },
  sectionTitle: {
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '2px',
  },
  item: { display: 'flex', alignItems: 'center', gap: '6px' },
  grow: { flexGrow: 1 },
  dot: { width: '12px', height: '12px', borderRadius: '3px', flexShrink: 0 },
  swatchBtn: {
    width: '18px',
    height: '18px',
    borderRadius: '5px',
    flexShrink: 0,
    cursor: 'pointer',
    padding: 0,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  palette: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  },
  paletteSwatch: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    cursor: 'pointer',
    padding: 0,
    border: `2px solid ${tokens.colorNeutralStroke2}`,
    transitionProperty: 'transform',
    transitionDuration: '0.1s',
    transitionTimingFunction: 'ease',
    ':hover': { transform: 'scale(1.15)' },
  },
  invite: {
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inviteRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
  code: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: '16px',
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '2px',
  },
  countdownWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  cwIcon: { fontSize: '22px' },
  cwDays: { fontSize: '16px', fontWeight: 700, lineHeight: 1.1 },
  cwTitle: { fontSize: '12px', opacity: 0.95 },
});

interface Props {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  spaceName: string;
  inviteCode: string;
  currentUserId: string;
  members: SpaceMember[];
  categories: Category[];
  activeMembers: Set<string>;
  activeCategories: Set<string>;
  onToggleMember: (id: string) => void;
  onToggleCategory: (id: string) => void;
  onChangeCategoryColor: (id: string, color: string) => void;
  nextCountdown: Countdown | null;
  onOpenCountdowns: () => void;
}

export function Sidebar({
  currentDate,
  onDateChange,
  spaceName,
  inviteCode,
  currentUserId,
  members,
  categories,
  activeMembers,
  activeCategories,
  onToggleMember,
  onToggleCategory,
  onChangeCategoryColor,
  nextCountdown,
  onOpenCountdowns,
}: Props) {
  const styles = useStyles();
  const [copied, setCopied] = useState(false);
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <aside className={styles.root}>
      <MiniCalendar value={currentDate} onChange={onDateChange} />

      {nextCountdown && (
        <button
          className={styles.countdownWidget}
          style={{ background: `linear-gradient(135deg, ${nextCountdown.color} 0%, ${nextCountdown.color}bb 100%)` }}
          onClick={onOpenCountdowns}
          title="Ver todas las fechas clave"
        >
          <span className={styles.cwIcon}>{nextCountdown.icon}</span>
          <span>
            <span className={styles.cwDays} style={{ display: 'block' }}>
              {countdownLabel(daysUntil(nextCountdown))}
            </span>
            <span className={styles.cwTitle}>{nextCountdown.title}</span>
          </span>
        </button>
      )}

      <div className={styles.section}>
        <Caption1 className={styles.sectionTitle}>Personas</Caption1>
        {members.map((m) => (
          <div key={m._id} className={styles.item}>
            <Checkbox
              checked={activeMembers.has(m._id)}
              onChange={() => onToggleMember(m._id)}
              label={
                <span className={styles.item}>
                  <span className={styles.dot} style={{ backgroundColor: m.color }} />
                  <Text>{m._id === currentUserId ? `${m.name} (tu)` : m.name}</Text>
                </span>
              }
            />
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <Caption1 className={styles.sectionTitle}>Categorias</Caption1>
        {categories.map((c) => (
          <div key={c._id} className={styles.item}>
            <Checkbox
              checked={activeCategories.has(c._id)}
              onChange={() => onToggleCategory(c._id)}
              label={
                <Text>
                  {c.icon} {c.name}
                </Text>
              }
            />
            <span className={styles.grow} />
            <Popover
              open={colorPickerFor === c._id}
              onOpenChange={(_, d) => setColorPickerFor(d.open ? c._id : null)}
              positioning="below-end"
            >
              <PopoverTrigger disableButtonEnhancement>
                <button
                  className={styles.swatchBtn}
                  style={{ backgroundColor: c.color }}
                  title="Cambiar color"
                  aria-label={`Cambiar color de ${c.name}`}
                />
              </PopoverTrigger>
              <PopoverSurface>
                <div className={styles.palette}>
                  {PALETTE.map((color) => (
                    <button
                      key={color}
                      className={styles.paletteSwatch}
                      style={{ backgroundColor: color }}
                      aria-label={`Color ${color}`}
                      onClick={() => {
                        onChangeCategoryColor(c._id, color);
                        setColorPickerFor(null);
                      }}
                    />
                  ))}
                </div>
              </PopoverSurface>
            </Popover>
          </div>
        ))}
      </div>

      <div className={styles.invite}>
        <Caption1 className={styles.sectionTitle}>{spaceName}</Caption1>
        <Text size={200}>Comparte este codigo con tu pareja para que se una:</Text>
        <div className={styles.inviteRow}>
          <span className={styles.code}>{inviteCode}</span>
          <Button
            size="small"
            appearance="subtle"
            icon={copied ? <Checkmark16Regular /> : <Copy16Regular />}
            onClick={copyCode}
          >
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </div>
    </aside>
  );
}
