import { FormEvent, useState } from 'react';
import {
  Button,
  Field,
  Input,
  Title3,
  Text,
  Divider,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { PeopleTeam24Filled, SignOut24Regular } from '@fluentui/react-icons';
import { useAuth } from '../auth/AuthContext';
import { createSpace, joinSpace } from '../../api/spaces';
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
  steps: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' },
  step: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' },
  stepIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '11px',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: '20px',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroFooter: { marginTop: '10px', fontSize: '14px', opacity: 0.85 },

  // Manchas de color difuminadas
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

  // --- Panel del formulario ---
  formPane: { display: 'grid', placeItems: 'center', padding: '24px' },
  card: {
    width: '440px',
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
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', color: tokens.colorBrandForeground1 },
  sub: { color: tokens.colorNeutralForeground3 },
  row: { display: 'flex', gap: '8px', alignItems: 'flex-end' },
  grow: { flexGrow: 1 },
});

export function SpaceOnboarding() {
  const styles = useStyles();
  const { user, setUser, logout } = useAuth();
  const [spaceName, setSpaceName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const applySpace = (spaceId: string) => {
    if (user) setUser({ ...user, spaceId });
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const space = await createSpace(spaceName);
      applySpace(space._id);
    } catch (err) {
      setError(apiError(err, 'No se pudo crear el espacio'));
    } finally {
      setBusy(false);
    }
  };

  const onJoin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const space = await joinSpace(code);
      applySpace(space._id);
    } catch (err) {
      setError(apiError(err, 'No se pudo unir al espacio'));
    } finally {
      setBusy(false);
    }
  };

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
          <h1 className={styles.heroTitle}>Un ultimo paso.</h1>
          <div className={styles.heroSub}>
            Creen su espacio compartido: es donde vivira su calendario, sus recuerdos y sus planes.
            Solo uno lo crea; el otro se une con el codigo.
          </div>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepIcon}>✨</span>
              Crea el espacio y comparte tu codigo
            </div>
            <div className={styles.step}>
              <span className={styles.stepIcon}>💌</span>
              O unete con el codigo de tu pareja
            </div>
          </div>
          <div className={styles.heroFooter}>Un espacio, para los dos ❤️</div>
        </div>
      </div>

      <div className={styles.formPane}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.brand}>
              <PeopleTeam24Filled />
              <Title3>Tu espacio de pareja</Title3>
            </div>
            <Button
              appearance="subtle"
              icon={<SignOut24Regular />}
              onClick={logout}
              title="Salir"
            />
          </div>

          <Text className={styles.sub}>
            Crea un espacio y comparte el codigo con tu pareja, o unete al de ella con su codigo de
            invitacion.
          </Text>

          {error && (
            <MessageBar intent="error">
              <MessageBarBody>{error}</MessageBarBody>
            </MessageBar>
          )}

          <form onSubmit={onCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Crear un espacio nuevo">
              <div className={styles.row}>
                <div className={styles.grow}>
                  <Input
                    size="large"
                    placeholder="Ej: Alberto y Paullette"
                    value={spaceName}
                    onChange={(_, d) => setSpaceName(d.value)}
                    required
                  />
                </div>
                <Button appearance="primary" size="large" type="submit" disabled={busy || !spaceName}>
                  Crear
                </Button>
              </div>
            </Field>
          </form>

          <Divider>o</Divider>

          <form onSubmit={onJoin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Unirse con un codigo de invitacion">
              <div className={styles.row}>
                <div className={styles.grow}>
                  <Input
                    size="large"
                    placeholder="Ej: K7QF3M"
                    value={code}
                    onChange={(_, d) => setCode(d.value.toUpperCase())}
                    required
                  />
                </div>
                <Button size="large" type="submit" disabled={busy || !code}>
                  Unirme
                </Button>
              </div>
            </Field>
          </form>
        </div>
      </div>
    </div>
  );
}
