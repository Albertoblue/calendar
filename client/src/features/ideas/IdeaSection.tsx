import { FormEvent, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Input,
  Text,
  Caption1,
  Spinner,
  Tooltip,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Search20Regular,
  Add16Filled,
  Delete16Regular,
  CalendarArrowRight16Regular,
  Checkmark16Regular,
  Open16Regular,
} from '@fluentui/react-icons';
import { Idea, IdeaInput, IdeaKind, SearchResult, SpaceMember } from '../../types';
import {
  fetchIdeas,
  createIdea,
  updateIdea,
  deleteIdea,
  rateIdea,
  searchMovies,
  searchPlaces,
} from '../../api/ideas';
import { StarRating } from '../memories/StarRating';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', minHeight: 0 },
  searchRow: { display: 'flex', gap: '8px' },
  grow: { flexGrow: 1 },
  scroll: { flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' },
  sectionTitle: { color: tokens.colorNeutralForeground3, textTransform: 'uppercase', letterSpacing: '0.4px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' },
  card: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  cardDone: { opacity: 0.6 },
  cover: {
    height: '180px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'grid',
    placeItems: 'center',
    fontSize: '36px',
  },
  body: { padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1 },
  title: { fontWeight: tokens.fontWeightSemibold, lineHeight: 1.2 },
  sub: { color: tokens.colorNeutralForeground3 },
  rating: { color: '#B58500', fontWeight: tokens.fontWeightSemibold },
  actions: { display: 'flex', gap: '2px', padding: '4px 6px', borderTop: `1px solid ${tokens.colorNeutralStroke2}`, flexWrap: 'wrap' },
  empty: { color: tokens.colorNeutralForeground3, padding: '12px 0' },
  series: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '6px',
    paddingTop: '6px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  progressRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  ratingName: { width: '54px', flexShrink: 0, color: tokens.colorNeutralForeground3 },
});

function resultToInput(r: SearchResult): IdeaInput {
  return {
    kind: r.kind,
    title: r.title,
    subtitle: r.subtitle,
    imageUrl: r.imageUrl,
    rating: r.rating,
    externalId: r.externalId,
    externalUrl: r.externalUrl,
    extra: r.extra,
  };
}

interface Props {
  kind: IdeaKind;
  members: SpaceMember[];
  currentUserId: string;
  onSchedule: (idea: Idea) => void;
}

export function IdeaSection({ kind, members, currentUserId, onSchedule }: Props) {
  const styles = useStyles();
  const qc = useQueryClient();
  const isPlace = kind === 'place';
  const placeholderIcon = isPlace ? '📍' : '🎬';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [configured, setConfigured] = useState(true);

  const ideasQuery = useQuery({ queryKey: ['ideas', kind], queryFn: () => fetchIdeas(kind) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['ideas', kind] });

  const createMut = useMutation({ mutationFn: createIdea, onSuccess: invalidate });
  const updateMut = useMutation({
    mutationFn: (v: { id: string; data: Partial<IdeaInput> }) => updateIdea(v.id, v.data),
    onSuccess: invalidate,
  });
  const deleteMut = useMutation({ mutationFn: deleteIdea, onSuccess: invalidate });
  const rateMut = useMutation({
    mutationFn: (v: { id: string; value: number }) => rateIdea(v.id, v.value),
    onSuccess: invalidate,
  });

  const isSeries = (idea: Idea) =>
    (idea.extra as Record<string, unknown> | undefined)?.mediaType === 'tv';

  const nextEpisode = (idea: Idea) => {
    const season = idea.progress?.season ?? 1;
    const episode = (idea.progress?.episode ?? 0) + 1;
    updateMut.mutate({ id: idea._id, data: { progress: { season, episode } } });
  };

  const doSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const resp = isPlace ? await searchPlaces(query.trim()) : await searchMovies(query.trim());
      setResults(resp.results);
      setConfigured(resp.configured);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addManual = () => {
    if (!query.trim()) return;
    createMut.mutate({ kind, title: query.trim() });
  };

  const ideas = ideasQuery.data ?? [];

  return (
    <div className={styles.root}>
      <form className={styles.searchRow} onSubmit={doSearch}>
        <div className={styles.grow}>
          <Input
            value={query}
            onChange={(_, d) => setQuery(d.value)}
            contentBefore={<Search20Regular />}
            placeholder={isPlace ? 'Buscar un lugar (restaurante, museo...)' : 'Buscar pelicula o serie'}
            style={{ width: '100%' }}
          />
        </div>
        <Button appearance="primary" type="submit" disabled={searching || !query.trim()}>
          Buscar
        </Button>
        <Tooltip content="Anadir a mano con este texto" relationship="label">
          <Button icon={<Add16Filled />} onClick={addManual} disabled={!query.trim()}>
            A mano
          </Button>
        </Tooltip>
      </form>

      <div className={styles.scroll}>
        {searching && <Spinner size="small" label="Buscando..." />}

        {searched && !searching && !configured && (
          <MessageBar intent="info">
            <MessageBarBody>
              No hay API configurada para {isPlace ? 'lugares' : 'peliculas'}. Puedes anadir a mano
              con el boton, o poner la key en el servidor.
            </MessageBarBody>
          </MessageBar>
        )}

        {results.length > 0 && (
          <div>
            <Caption1 className={styles.sectionTitle}>Resultados</Caption1>
            <div className={styles.grid}>
              {results.map((r, i) => (
                <div key={`${r.externalId}-${i}`} className={styles.card}>
                  <div
                    className={styles.cover}
                    style={
                      r.imageUrl
                        ? { backgroundImage: `url(${r.imageUrl})` }
                        : { background: tokens.colorNeutralBackground3 }
                    }
                  >
                    {!r.imageUrl && placeholderIcon}
                  </div>
                  <div className={styles.body}>
                    <Text className={styles.title}>{r.title}</Text>
                    {r.subtitle && <Caption1 className={styles.sub}>{r.subtitle}</Caption1>}
                    {typeof r.rating === 'number' && (
                      <Caption1 className={styles.rating}>★ {r.rating.toFixed(1)}</Caption1>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <Button
                      appearance="primary"
                      size="small"
                      icon={<Add16Filled />}
                      onClick={() => createMut.mutate(resultToInput(r))}
                    >
                      Anadir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Caption1 className={styles.sectionTitle}>
            {isPlace ? 'Lugares guardados' : 'Por ver'}
          </Caption1>
          {ideasQuery.isLoading ? (
            <Spinner size="small" />
          ) : ideas.length === 0 ? (
            <Text className={styles.empty}>
              Aun no hay nada. Busca arriba y pulsa Anadir, o anade a mano.
            </Text>
          ) : (
            <div className={styles.grid}>
              {ideas.map((idea) => (
                <div key={idea._id} className={`${styles.card} ${idea.done ? styles.cardDone : ''}`}>
                  <div
                    className={styles.cover}
                    style={
                      idea.imageUrl
                        ? { backgroundImage: `url(${idea.imageUrl})` }
                        : { background: `linear-gradient(135deg, #0F6CBD 0%, #6E48AA 100%)`, color: '#fff' }
                    }
                  >
                    {!idea.imageUrl && placeholderIcon}
                  </div>
                  <div className={styles.body}>
                    <Text className={styles.title}>{idea.title}</Text>
                    {idea.subtitle && <Caption1 className={styles.sub}>{idea.subtitle}</Caption1>}
                    {typeof idea.rating === 'number' && (
                      <Caption1 className={styles.rating}>★ {idea.rating.toFixed(1)}</Caption1>
                    )}
                    {isSeries(idea) && (
                      <div className={styles.series}>
                        <div className={styles.progressRow}>
                          <Caption1>
                            Vais por T{idea.progress?.season ?? 1}·E{idea.progress?.episode ?? 0}
                          </Caption1>
                          <Button size="small" appearance="subtle" onClick={() => nextEpisode(idea)}>
                            +1 ep
                          </Button>
                        </div>
                        {members.map((m) => {
                          const val = idea.ratings?.find((r) => r.userId === m._id)?.value ?? 0;
                          const mine = m._id === currentUserId;
                          return (
                            <div key={m._id} className={styles.ratingRow}>
                              <Caption1 className={styles.ratingName}>{mine ? 'Tu' : m.name}</Caption1>
                              <StarRating
                                value={val}
                                size={16}
                                onChange={
                                  mine ? (v) => rateMut.mutate({ id: idea._id, value: v }) : undefined
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <Tooltip content="Agendar en el calendario" relationship="label">
                      <Button
                        size="small"
                        appearance="subtle"
                        icon={<CalendarArrowRight16Regular />}
                        onClick={() => onSchedule(idea)}
                      />
                    </Tooltip>
                    <Tooltip content={idea.done ? 'Marcar pendiente' : isPlace ? 'Marcar visitado' : 'Marcar visto'} relationship="label">
                      <Button
                        size="small"
                        appearance={idea.done ? 'primary' : 'subtle'}
                        icon={<Checkmark16Regular />}
                        onClick={() => updateMut.mutate({ id: idea._id, data: { done: !idea.done } })}
                      />
                    </Tooltip>
                    {idea.externalUrl && (
                      <Tooltip content="Abrir enlace" relationship="label">
                        <Button
                          size="small"
                          appearance="subtle"
                          icon={<Open16Regular />}
                          onClick={() => window.open(idea.externalUrl, '_blank', 'noopener')}
                        />
                      </Tooltip>
                    )}
                    <Tooltip content="Eliminar" relationship="label">
                      <Button
                        size="small"
                        appearance="subtle"
                        icon={<Delete16Regular />}
                        onClick={() => deleteMut.mutate(idea._id)}
                      />
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
