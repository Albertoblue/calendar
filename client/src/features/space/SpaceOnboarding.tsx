import { FormEvent, useState } from 'react';
import {
  Button,
  Field,
  Input,
  Title2,
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

const useStyles = makeStyles({
  root: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: tokens.colorNeutralBackground2,
    padding: '16px',
  },
  card: {
    width: '440px',
    maxWidth: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '12px',
    boxShadow: tokens.shadow16,
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', color: tokens.colorBrandForeground1 },
  row: { display: 'flex', gap: '8px', alignItems: 'flex-end' },
  grow: { flexGrow: 1 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
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
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.brand}>
            <PeopleTeam24Filled />
            <Title2>Tu espacio de pareja</Title2>
          </div>
          <Button appearance="subtle" icon={<SignOut24Regular />} onClick={logout} title="Salir" />
        </div>
        <Text>
          Crea un espacio compartido y comparte el codigo con tu pareja, o unete al de ella con su
          codigo de invitacion.
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
                  placeholder="Ej: Alberto y Sofia"
                  value={spaceName}
                  onChange={(_, d) => setSpaceName(d.value)}
                  required
                />
              </div>
              <Button appearance="primary" type="submit" disabled={busy || !spaceName}>
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
                  placeholder="Ej: K7QF3M"
                  value={code}
                  onChange={(_, d) => setCode(d.value.toUpperCase())}
                  required
                />
              </div>
              <Button type="submit" disabled={busy || !code}>
                Unirme
              </Button>
            </div>
          </Field>
        </form>
      </div>
    </div>
  );
}
