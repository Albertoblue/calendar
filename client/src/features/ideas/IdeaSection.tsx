import { FormEvent, useCallback, useEffect, useState } from 'react';
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
  Heart16Filled,
  Heart16Regular,
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
  topRatedWatch,
  discoverPlaces,
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

// Ubicacion por defecto: Centro Historico de la Ciudad de Mexico (Zocalo).
// Si el navegador no da la ubicacion real, mostramos imprescindibles de aqui.
const DEFAULT_COORDS = { lat: 19.4326, lng: -99.1332 };

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
  const topRatedQuery = useQuery({
    queryKey: ['topRated'],
    queryFn: topRatedWatch,
    enabled: kind === 'watch',
    retry: 1,
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'denied' | 'unavailable'>(
    'idle'
  );
  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unavailable');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('ok');
      },
      () => setGeoStatus('denied'),
      { timeout: 8000 }
    );
  }, []);
  useEffect(() => {
    if (kind === 'place' && geoStatus === 'idle') requestLocation();
  }, [kind, geoStatus, requestLocation]);
  // Coordenadas efectivas: la ubicacion real del usuario si la dio, o el Centro
  // de CDMX por defecto. Asi siempre hay recomendaciones (no se queda cargando).
  const effectiveCoords = coords ?? DEFAULT_COORDS;
  const usingDefaultLocation = coords == null;
  const placesDiscoverQuery = useQuery({
    queryKey: ['discoverPlaces', effectiveCoords.lat, effectiveCoords.lng],
    queryFn: () => discoverPlaces(effectiveCoords.lat, effectiveCoords.lng),
    enabled: kind === 'place',
    retry: 1,
  });

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

  // Que mostrar en la zona de "resultados": la busqueda si se hizo, o las mejor
  // valoradas de inicio (solo en pelis/series).
  const showingSearch = searched;
  const discoverData = kind === 'watch' ? topRatedQuery.data : placesDiscoverQuery.data;
  const displayResults = showingSearch ? results : discoverData?.results ?? [];
  const displayConfigured = showingSearch ? configured : discoverData?.configured ?? true;
  const resultsLoading = showingSearch
    ? searching
    : kind === 'watch'
      ? topRatedQuery.isLoading
      : placesDiscoverQuery.isLoading;
  const resultsTitle = showingSearch
    ? 'Resultados'
    : kind === 'watch'
      ? 'Mejor valoradas'
      : usingDefaultLocation
        ? 'Imprescindibles en el Centro de CDMX'
        : 'Imprescindibles cerca de ti';
  // Pista opcional: mostramos CDMX por defecto y ofrecemos usar la ubicacion real.
  const offerLocation =
    !showingSearch &&
    kind === 'place' &&
    usingDefaultLocation &&
    geoStatus !== 'loading' &&
    displayConfigured;
  const discoverError =
    !showingSearch &&
    (kind === 'watch'
      ? topRatedQuery.isError
      : kind === 'place'
        ? placesDiscoverQuery.isError
        : false);
  const retryDiscover = () =>
    kind === 'watch' ? topRatedQuery.refetch() : placesDiscoverQuery.refetch();
  const loadingLabel = showingSearch ? 'Buscando...' : 'Cargando recomendaciones...';

  return (
    <div className={styles.root}>
      <form className={styles.searchRow} onSubmit={doSearch}>
        <div className={styles.grow}>
          <Input
            value={query}
            onChange={(_, d) => {
              setQuery(d.value);
              if (d.value.trim() === '') setSearched(false);
            }}
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
        {resultsLoading && <Spinner size="small" label={loadingLabel} />}

        {!resultsLoading && !displayConfigured && (
          <MessageBar intent="info">
            <MessageBarBody>
              No hay API configurada para {isPlace ? 'lugares' : 'peliculas'}. Puedes anadir a mano
              con el boton, o poner la key en el servidor.
            </MessageBarBody>
          </MessageBar>
        )}

        {offerLocation && (
          <MessageBar intent="info">
            <MessageBarBody>
              Mostrando el Centro de CDMX. Activa tu ubicacion para ver los imprescindibles cerca de
              vosotros, o busca una ciudad arriba.{' '}
              <Button size="small" appearance="primary" onClick={requestLocation}>
                Usar mi ubicacion
              </Button>
            </MessageBarBody>
          </MessageBar>
        )}

        {discoverError && !resultsLoading && (
          <MessageBar intent="error">
            <MessageBarBody>
              No se pudieron cargar las recomendaciones. Revisa la API key o la conexion e intenta de
              nuevo.{' '}
              <Button size="small" onClick={() => retryDiscover()}>
                Reintentar
              </Button>
            </MessageBarBody>
          </MessageBar>
        )}

        {displayResults.length > 0 && (
          <div>
            <Caption1 className={styles.sectionTitle}>{resultsTitle}</Caption1>
            <div className={styles.grid}>
              {displayResults.map((r, i) => (
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
                    <Tooltip content="Anadir a favoritos" relationship="label">
                      <Button
                        size="small"
                        appearance="subtle"
                        icon={<Heart16Regular />}
                        onClick={() => createMut.mutate({ ...resultToInput(r), favorite: true })}
                      />
                    </Tooltip>
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
                    <Tooltip
                      content={idea.favorite ? 'Quitar de favoritos' : 'Marcar favorito'}
                      relationship="label"
                    >
                      <Button
                        size="small"
                        appearance="subtle"
                        style={idea.favorite ? { color: '#E3008C' } : undefined}
                        icon={idea.favorite ? <Heart16Filled /> : <Heart16Regular />}
                        onClick={() =>
                          updateMut.mutate({ id: idea._id, data: { favorite: !idea.favorite } })
                        }
                      />
                    </Tooltip>
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
