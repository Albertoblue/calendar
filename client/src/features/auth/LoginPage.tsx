import { FormEvent, useState } from 'react';
import {
  Button,
  Field,
  Input,
  Tab,
  TabList,
  Title2,
  Text,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { CalendarLtr24Filled } from '@fluentui/react-icons';
import { useAuth } from './AuthContext';
import { apiError } from '../../api/client';

const useStyles = makeStyles({
  root: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, #0F6CBD 0%, #6E48AA 100%)',
    padding: '16px',
  },
  card: {
    width: '380px',
    maxWidth: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '12px',
    boxShadow: tokens.shadow28,
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: tokens.colorBrandForeground1,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  swatches: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  swatch: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    cursor: 'pointer',
    border: `2px solid ${tokens.colorNeutralStroke1}`,
  },
  swatchActive: { outline: `2px solid ${tokens.colorBrandStroke1}`, outlineOffset: '2px' },
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

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <CalendarLtr24Filled />
          <Title2>Nuestro Calendario</Title2>
        </div>
        <Text>Planeen sus actividades en pareja, juntos.</Text>

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
              <Input value={name} onChange={(_, d) => setName(d.value)} required />
            </Field>
          )}
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(_, d) => setEmail(d.value)}
              required
            />
          </Field>
          <Field label="Contraseña">
            <Input
              type="password"
              value={password}
              onChange={(_, d) => setPassword(d.value)}
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

          <Button appearance="primary" type="submit" disabled={busy}>
            {busy ? 'Un momento...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>
      </div>
    </div>
  );
}
