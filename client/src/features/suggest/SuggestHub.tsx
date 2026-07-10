import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Button,
  Input,
  Dropdown,
  Option,
  Field,
  Text,
  Title3,
  Caption1,
  Badge,
  Spinner,
  Tooltip,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Sparkle20Regular,
  Sparkle20Filled,
  CalendarArrowRight16Regular,
  Add16Filled,
} from '@fluentui/react-icons';
import { Suggestion } from '../../types';
import { suggestPlans } from '../../api/suggest';

const MOMENTS = ['Cualquiera', 'Esta noche', 'Viernes noche', 'Fin de semana', 'Entre semana', 'Todo el dia'];
const VIBES = ['Cualquiera', 'Romantico', 'Aventura', 'Tranqui', 'Cultural', 'Divertido', 'Gastronomico'];
const BUDGETS = ['Cualquiera', 'Gratis o bajo', 'Medio', 'Alto'];

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
    padding: '14px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorBrandForeground1,
  },
  grow: { flexGrow: 1 },
  form: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    padding: '14px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  field: { minWidth: '150px' },
  body: { flexGrow: 1, overflowY: 'auto', padding: '16px 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' },
  card: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
  title: { fontWeight: tokens.fontWeightSemibold },
  tip: { color: tokens.colorNeutralForeground3, fontStyle: 'italic' },
  actions: { display: 'flex', gap: '6px', marginTop: '4px' },
  empty: {
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    padding: '24px',
  },
  footer: { padding: '8px 20px', borderTop: `1px solid ${tokens.colorNeutralStroke2}`, color: tokens.colorNeutralForeground3 },
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSchedule: (s: Suggestion) => void;
  onAddToWishlist: (s: Suggestion) => void;
}

const clean = (v: string) => (v === 'Cualquiera' ? undefined : v);

export function SuggestHub({ open, onClose, onSchedule, onAddToWishlist }: Props) {
  const styles = useStyles();
  const [moment, setMoment] = useState(MOMENTS[0]);
  const [vibe, setVibe] = useState(VIBES[0]);
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [notes, setNotes] = useState('');

  const mut = useMutation({ mutationFn: suggestPlans });

  if (!open) return null;

  const suggestions = mut.data?.suggestions ?? [];
  const configured = mut.data?.configured ?? true;

  const run = () =>
    mut.mutate({ moment: clean(moment), vibe: clean(vibe), budget: clean(budget), notes: notes.trim() || undefined });

  const renderDropdown = (
    value: string,
    setValue: (v: string) => void,
    options: string[],
    label: string
  ) => (
    <Field label={label} className={styles.field}>
      <Dropdown
        value={value}
        selectedOptions={[value]}
        onOptionSelect={(_, d) => setValue((d.optionValue as string) ?? value)}
      >
        {options.map((o) => (
          <Option key={o} value={o} text={o}>
            {o}
          </Option>
        ))}
      </Dropdown>
    </Field>
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span style={{ fontSize: '22px' }}>✨</span>
          <Title3 className={styles.grow}>Sugeridor de planes</Title3>
          <Tooltip content="Cerrar" relationship="label">
            <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />
          </Tooltip>
        </div>

        <div className={styles.form}>
          {renderDropdown(moment, setMoment, MOMENTS, 'Momento')}
          {renderDropdown(vibe, setVibe, VIBES, 'Estilo')}
          {renderDropdown(budget, setBudget, BUDGETS, 'Presupuesto')}
          <Field label="Notas (opcional)" className={styles.grow}>
            <Input
              value={notes}
              onChange={(_, d) => setNotes(d.value)}
              placeholder="Ej: sin coche, en casa, celebramos algo..."
            />
          </Field>
          <Button
            appearance="primary"
            icon={mut.isPending ? <Sparkle20Filled /> : <Sparkle20Regular />}
            onClick={run}
            disabled={mut.isPending}
          >
            {mut.isPending ? 'Pensando...' : 'Sugerir planes'}
          </Button>
        </div>

        <div className={styles.body}>
          {mut.isError && (
            <MessageBar intent="error">
              <MessageBarBody>No se pudieron generar sugerencias. Intentalo de nuevo.</MessageBarBody>
            </MessageBar>
          )}

          {!configured && (
            <MessageBar intent="info">
              <MessageBarBody>
                El sugeridor con IA no esta configurado. Anade tu ANTHROPIC_API_KEY en el servidor
                para activarlo.
              </MessageBarBody>
            </MessageBar>
          )}

          {mut.isPending ? (
            <div className={styles.empty}>
              <Spinner label="Generando ideas para vosotros..." />
            </div>
          ) : suggestions.length === 0 ? (
            <div className={styles.empty}>
              <Text as="p">
                Elige momento, estilo y presupuesto (o dejalo en Cualquiera) y pulsa Sugerir planes.
              </Text>
            </div>
          ) : (
            <div className={styles.grid}>
              {suggestions.map((s, i) => (
                <div key={i} className={styles.card}>
                  <div className={styles.cardTop}>
                    <Text className={styles.title}>{s.title}</Text>
                    <Badge appearance="tint" color="brand">
                      {s.category}
                    </Badge>
                  </div>
                  <Text>{s.description}</Text>
                  <Caption1>{`~${s.estimatedHours} h`}</Caption1>
                  {s.tip && <Caption1 className={styles.tip}>💡 {s.tip}</Caption1>}
                  <div className={styles.actions}>
                    <Button
                      size="small"
                      appearance="primary"
                      icon={<CalendarArrowRight16Regular />}
                      onClick={() => onSchedule(s)}
                    >
                      Agendar
                    </Button>
                    <Button size="small" icon={<Add16Filled />} onClick={() => onAddToWishlist(s)}>
                      A deseos
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Caption1>Sugerencias generadas con IA (Claude). Revisa disponibilidad y reservas.</Caption1>
        </div>
      </div>
    </div>
  );
}
