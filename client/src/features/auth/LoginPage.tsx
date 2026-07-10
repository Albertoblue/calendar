import { FormEvent, useState } from 'react';
import {
  Button,
  Field,
  Input,
  Tab,
  TabList,
  Title2,
  Title3,
  Text,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  CalendarLtr24Filled,
  CalendarLtr24Regular,
  Lightbulb24Regular,
  Gift24Regular,
} from '@fluentui/react-icons';
import { useAuth } from './AuthContext';
import { apiError } from '../../api/client';

const HERO_GRADIENT = 'linear-gradient(135deg, #0F6CBD 0%, #6E48AA 55%, #E3008C 100%)';

const useStyles = makeStyles({
  root: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    backgroundColor: tokens.colorNeutralBackground2,
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      backgroundImage: HERO_GRADIENT,
    },
  },

  // --- Panel hero (izquierda, solo desktop) ---
  hero: {
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    color: '#fff',
    backgroundImage: HERO_GRADIENT,
    '@media (max-width: 768px)': { display: 'none' },
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '440px',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  heroBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  heroLogo: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    fontSize: '28px',
  },
  heroBrandName: { fontSize: '20px', fontWeight: 600, letterSpacing: '0.3px' },
  heroTitle: { fontSize: '42px', lineHeight: '1.08', fontWeight: 700, margin: 0 },
  heroSub: { fontSize: '17px', opacity: 0.92, lineHeight: '1.5' },
  features: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' },
  feature: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' },
  featureIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '11px',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroFooter: { marginTop: '10px', fontSize: '14px', opacity: 0.85 },

  // Manchas de color difuminadas que dan profundidad al hero
  blob: { position: 'absolute', borderRadius: '50%', filter: 'blur(64px)', opacity: 0.45 },
  blobA: {
    width: '340px',
    height: '340px',
    backgroundColor: '#E3008C',
    top: '-90px',
    right: '-70px',
    animationName: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(30px)' } },
    animationDuration: '7s',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
    animationTimingFunction: 'ease-in-out',
  },
  blobB: {
    width: '280px',
    height: '280px',
    backgroundColor: '#4CC2FF',
    bottom: '-80px',
    left: '-60px',
    animationName: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-28px)' } },
    animationDuration: '9s',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
    animationTimingFunction: 'ease-in-out',
  },

  // --- Panel del formulario (derecha / unica columna en movil) ---
  formPane: { display: 'grid', placeItems: 'center', padding: '24px' },
  card: {
    width: '400px',
    maxWidth: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '18px',
    boxShadow: tokens.shadow64,
    padding: '36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    '@media (max-width: 768px)': { padding: '28px 22px' },
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', color: tokens.colorBrandForeground1 },
  brandIcon: { fontSize: '26px', display: 'grid', placeItems: 'center' },
  brandName: { fontWeight: 700, fontSize: '18px' },
  heading: { display: 'flex', flexDirection: 'column', gap: '2px' },
  sub: { color: tokens.colorNeutralForeground3 },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  swatches: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  swatch: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    cursor: 'pointer',
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    transitionProperty: 'transform',
    transitionDuration: '0.12s',
    transitionTimingFunction: 'ease',
  },
  swatchActive: {
    outline: `2px solid ${tokens.colorBrandStroke1}`,
    outlineOffset: '2px',
    transform: 'scale(1.12)',
  },
  submitBtn: { width: '100%', marginTop: '4px' },
});

const COLORS = ['#0F6CBD', '#E3008C', '#107C10', '#CA5010', '#8764B8', '#D13438'];

export function LoginPage() {
  const styles = useStyles();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, color });
      }
    } catch (err) {
      setError(apiError(err, 'No se pudo completar la operacion'));
    } finally {
      setBusy(false);
    }
  };

  const features = [
    { icon: <CalendarLtr24Regular />, text: 'Su calendario compartido, en tiempo real' },
    { icon: <Lightbulb24Regular />, text: 'Ideas de planes, pelis, series y lugares' },
    { icon: <Gift24Regular />, text: 'Recuerdos, fechas clave y regalos sorpresa' },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <div className={`${styles.blob} ${styles.blobA}`} />
        <div className={`${styles.blob} ${styles.blobB}`} />
        <div className={styles.heroContent}>
          <div className={styles.heroBrand}>
            <span className={styles.heroLogo}>📅</span>
            <span className={styles.heroBrandName}>Nuestro Calendario</span>
          </div>
          <h1 className={styles.heroTitle}>Planeen su vida, juntos.</h1>
          <div className={styles.heroSub}>
            Un solo lugar para sus planes, recuerdos y sorpresas. Lo que uno agenda, el otro lo ve al
            instante.
          </div>
          <div className={styles.features}>
            {features.map((f) => (
              <div key={f.text} className={styles.feature}>
                <span className={styles.featureIcon}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
          <div className={styles.heroFooter}>Hecho con cariño para dos ❤️</div>
        </div>
      </div>

      <div className={styles.formPane}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>
              <CalendarLtr24Filled />
            </span>
            <span className={styles.brandName}>Nuestro Calendario</span>
          </div>

          <div className={styles.heading}>
            <Title3>{mode === 'login' ? 'Bienvenidos de vuelta' : 'Creen su cuenta'}</Title3>
            <Text className={styles.sub}>
              {mode === 'login'
                ? 'Inicia sesion para ver su calendario.'
                : 'Empiecen a planear su vida en pareja.'}
            </Text>
          </div>

          <TabList
            selectedValue={mode}
            onTabSelect={(_, d) => {
              setMode(d.value as 'login' | 'register');
              setError('');
            }}
          >
            <Tab value="login">Iniciar sesion</Tab>
            <Tab value="register">Crear cuenta</Tab>
          </TabList>

          {error && (
            <MessageBar intent="error">
              <MessageBarBody>{error}</MessageBarBody>
            </MessageBar>
          )}

          <form className={styles.form} onSubmit={submit}>
            {mode === 'register' && (
              <Field label="Nombre">
                <Input
                  size="large"
                  value={name}
                  onChange={(_, d) => setName(d.value)}
                  placeholder="Tu nombre"
                  required
                />
              </Field>
            )}
            <Field label="Email">
              <Input
                size="large"
                type="email"
                value={email}
                onChange={(_, d) => setEmail(d.value)}
                placeholder="tu@email.com"
                required
              />
            </Field>
            <Field label="Contraseña">
              <Input
                size="large"
                type="password"
                value={password}
                onChange={(_, d) => setPassword(d.value)}
                placeholder="••••••••"
                required
              />
            </Field>

            {mode === 'register' && (
              <Field label="Tu color en el calendario">
                <div className={styles.swatches}>
                  {COLORS.map((c) => (
                    <div
                      key={c}
                      className={`${styles.swatch} ${color === c ? styles.swatchActive : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                      role="button"
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </Field>
            )}

            <Button
              className={styles.submitBtn}
              size="large"
              appearance="primary"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Un momento...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
