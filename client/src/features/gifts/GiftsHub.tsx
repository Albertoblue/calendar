import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  TabList,
  Tab,
  Title3,
  Text,
  Caption1,
  Badge,
  Spinner,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Add16Filled,
  Edit16Regular,
  Delete16Regular,
  Open16Regular,
  Checkmark16Regular,
} from '@fluentui/react-icons';
import { Gift, GiftInput, GiftOccasion, SpaceMember } from '../../types';
import { fetchGifts, createGift, updateGift, deleteGift, reserveGift } from '../../api/gifts';
import { GiftDialog } from './GiftDialog';

const OCCASION: Record<GiftOccasion, string> = {
  birthday: '🎂 Cumpleanos',
  christmas: '🎄 Navidad',
  other: '🎁 Regalo',
};
const PRIORITY: Record<string, { label: string; color: 'danger' | 'warning' | 'informative' }> = {
  high: { label: 'Alta', color: 'danger' },
  medium: { label: 'Media', color: 'warning' },
  low: { label: 'Baja', color: 'informative' },
};

const useStyles = makeStyles({
  overlay: { position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.55)', display: 'grid', placeItems: 'center', padding: '24px' },
  panel: { width: '100%', maxWidth: '1000px', height: '90vh', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '12px', boxShadow: tokens.shadow64, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, color: tokens.colorBrandForeground1 },
  grow: { flexGrow: 1 },
  tabsRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 20px 0' },
  body: { flexGrow: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px' },
  hint: { color: tokens.colorNeutralForeground3, marginBottom: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' },
  card: { border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: tokens.colorNeutralBackground1 },
  cover: { height: '130px', backgroundSize: 'cover', backgroundPosition: 'center', display: 'grid', placeItems: 'center', fontSize: '36px', color: '#fff' },
  cardBody: { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 },
  titleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' },
  title: { fontWeight: tokens.fontWeightSemibold, wordBreak: 'break-word' },
  badges: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' },
  price: { color: tokens.colorNeutralForeground2, fontWeight: tokens.fontWeightSemibold },
  notes: { color: tokens.colorNeutralForeground3 },
  actions: { display: 'flex', gap: '2px', padding: '4px 6px', borderTop: `1px solid ${tokens.colorNeutralStroke2}`, flexWrap: 'wrap', alignItems: 'center' },
  empty: { color: tokens.colorNeutralForeground3, textAlign: 'center', padding: '32px' },
});

interface Props {
  open: boolean;
  onClose: () => void;
  members: SpaceMember[];
  currentUserId: string;
}

export function GiftsHub({ open, onClose, members, currentUserId }: Props) {
  const styles = useStyles();
  const qc = useQueryClient();
  const [tab, setTab] = useState<string>(currentUserId);
  const [dialog, setDialog] = useState<{ open: boolean; gift: Gift | null }>({ open: false, gift: null });

  const giftsQ = useQuery({ queryKey: ['gifts'], queryFn: fetchGifts, enabled: open });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['gifts'] });
  const closeDialog = () => setDialog({ open: false, gift: null });

  const createMut = useMutation({ mutationFn: createGift, onSuccess: () => { invalidate(); closeDialog(); } });
  const updateMut = useMutation({
    mutationFn: (v: { id: string; data: Partial<GiftInput> }) => updateGift(v.id, v.data),
    onSuccess: () => { invalidate(); closeDialog(); },
  });
  const deleteMut = useMutation({ mutationFn: deleteGift, onSuccess: invalidate });
  const reserveMut = useMutation({
    mutationFn: (v: { id: string; status: 'reserved' | 'bought' | 'none' }) => reserveGift(v.id, v.status),
    onSuccess: invalidate,
  });

  if (!open) return null;

  const selectedIsMe = tab === currentUserId;
  const gifts = (giftsQ.data ?? []).filter((g) => g.ownerId === tab);
  const memberName = (id: string) => members.find((m) => m._id === id)?.name ?? 'alguien';

  const handleSubmit = (input: GiftInput, id?: string) => {
    if (id) updateMut.mutate({ id, data: input });
    else createMut.mutate(input);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span style={{ fontSize: '22px' }}>🎁</span>
          <Title3 className={styles.grow}>Regalos</Title3>
          <Tooltip content="Cerrar" relationship="label">
            <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />
          </Tooltip>
        </div>

        <div className={styles.tabsRow}>
          <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value as string)}>
            {members.map((m) => (
              <Tab key={m._id} value={m._id}>
                {m._id === currentUserId ? 'Mis regalos' : m.name}
              </Tab>
            ))}
          </TabList>
          <div className={styles.grow} />
          {selectedIsMe && (
            <Button appearance="primary" icon={<Add16Filled />} onClick={() => setDialog({ open: true, gift: null })}>
              Nuevo regalo
            </Button>
          )}
        </div>

        <div className={styles.body}>
          <Caption1 className={styles.hint}>
            {selectedIsMe
              ? 'Anade lo que te gustaria recibir. No veras quien ha reservado tus regalos (¡sorpresa!).'
              : `Aqui puedes reservar un regalo de ${memberName(tab)} para que no lo compreis los dos.`}
          </Caption1>

          {giftsQ.isLoading ? (
            <Spinner label="Cargando..." />
          ) : gifts.length === 0 ? (
            <div className={styles.empty}>
              {selectedIsMe ? 'Aun no has pedido nada. ¡Anade tu primer deseo!' : 'Todavia no ha pedido nada.'}
            </div>
          ) : (
            <div className={styles.grid}>
              {gifts.map((g) => {
                const prio = PRIORITY[g.priority];
                const reservedByMe = g.reservedBy === currentUserId;
                return (
                  <div key={g._id} className={styles.card}>
                    <div
                      className={styles.cover}
                      style={
                        g.imageUrl
                          ? { backgroundImage: `url(${g.imageUrl})` }
                          : { background: 'linear-gradient(135deg, #E3008C 0%, #6E48AA 100%)' }
                      }
                    >
                      {!g.imageUrl && '🎁'}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.titleRow}>
                        <Text className={styles.title}>{g.title}</Text>
                        {typeof g.price === 'number' && (
                          <span className={styles.price}>{g.price} €</span>
                        )}
                      </div>
                      <div className={styles.badges}>
                        <Badge appearance="tint">{OCCASION[g.occasion]}</Badge>
                        <Badge appearance="tint" color={prio.color} size="small">
                          {prio.label}
                        </Badge>
                      </div>
                      {g.notes && <Caption1 className={styles.notes}>{g.notes}</Caption1>}
                    </div>

                    <div className={styles.actions}>
                      {g.url && (
                        <Tooltip content="Abrir enlace" relationship="label">
                          <Button
                            size="small"
                            appearance="subtle"
                            icon={<Open16Regular />}
                            onClick={() => window.open(g.url, '_blank', 'noopener')}
                          />
                        </Tooltip>
                      )}

                      {selectedIsMe ? (
                        <>
                          <Tooltip content="Editar" relationship="label">
                            <Button
                              size="small"
                              appearance="subtle"
                              icon={<Edit16Regular />}
                              onClick={() => setDialog({ open: true, gift: g })}
                            />
                          </Tooltip>
                          <Tooltip content="Eliminar" relationship="label">
                            <Button
                              size="small"
                              appearance="subtle"
                              icon={<Delete16Regular />}
                              onClick={() => deleteMut.mutate(g._id)}
                            />
                          </Tooltip>
                        </>
                      ) : g.reservedStatus && reservedByMe ? (
                        <>
                          <Badge appearance="tint" color="success" icon={<Checkmark16Regular />}>
                            {g.reservedStatus === 'bought' ? 'Comprado por ti' : 'Reservado por ti'}
                          </Badge>
                          <div className={styles.grow} />
                          {g.reservedStatus === 'reserved' && (
                            <Button
                              size="small"
                              appearance="subtle"
                              onClick={() => reserveMut.mutate({ id: g._id, status: 'bought' })}
                            >
                              Marcar comprado
                            </Button>
                          )}
                          <Button
                            size="small"
                            appearance="subtle"
                            onClick={() => reserveMut.mutate({ id: g._id, status: 'none' })}
                          >
                            Quitar
                          </Button>
                        </>
                      ) : g.reservedStatus && !reservedByMe ? (
                        <Badge appearance="tint">Reservado por {memberName(g.reservedBy ?? '')}</Badge>
                      ) : (
                        <>
                          <Button
                            size="small"
                            appearance="primary"
                            onClick={() => reserveMut.mutate({ id: g._id, status: 'reserved' })}
                          >
                            Reservar
                          </Button>
                          <Button
                            size="small"
                            appearance="subtle"
                            onClick={() => reserveMut.mutate({ id: g._id, status: 'bought' })}
                          >
                            Comprado
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <GiftDialog
        open={dialog.open}
        onClose={closeDialog}
        gift={dialog.gift}
        onSubmit={handleSubmit}
        busy={createMut.isPending || updateMut.isPending}
      />
    </div>
  );
}
