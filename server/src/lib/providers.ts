import { env } from '../config/env';

export interface SearchResult {
  kind: 'place' | 'watch';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  rating?: number;
  externalId?: string;
  externalUrl?: string;
  extra?: Record<string, unknown>;
}

/** Se lanza cuando falta la API key del proveedor (para caer a modo manual). */
export class NotConfigured extends Error {
  constructor(public provider: string) {
    super(`${provider} no configurado`);
    this.name = 'NotConfigured';
  }
}

// fetch con timeout: evita que una llamada externa deje la peticion colgada.
async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// --- TMDB: peliculas y series ---
function mapWatch(r: any, mediaType: 'movie' | 'tv'): SearchResult {
  const isMovie = mediaType === 'movie';
  const date: string | undefined = isMovie ? r.release_date : r.first_air_date;
  const year = date ? new Date(date).getFullYear() : undefined;
  return {
    kind: 'watch',
    title: isMovie ? r.title : r.name,
    subtitle: `${isMovie ? 'Pelicula' : 'Serie'}${year ? ` · ${year}` : ''}`,
    imageUrl: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : undefined,
    rating: r.vote_average ? Math.round(r.vote_average * 10) / 10 : undefined,
    externalId: String(r.id),
    externalUrl: `https://www.themoviedb.org/${mediaType}/${r.id}`,
    extra: { mediaType, year, overview: r.overview },
  };
}

export async function searchMovies(query: string): Promise<SearchResult[]> {
  if (!env.tmdbKey) throw new NotConfigured('TMDB');

  const url =
    `https://api.themoviedb.org/3/search/multi?api_key=${env.tmdbKey}` +
    `&language=es-ES&include_adult=false&query=${encodeURIComponent(query)}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`TMDB respondio ${res.status}`);
  const data = (await res.json()) as { results?: any[] };

  return (data.results ?? [])
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .slice(0, 12)
    .map((r): SearchResult => mapWatch(r, r.media_type));
}

// Mejor valoradas (para mostrar de inicio, sin busqueda): mezcla pelis + series.
export async function topRatedWatch(): Promise<SearchResult[]> {
  if (!env.tmdbKey) throw new NotConfigured('TMDB');
  const base = `api_key=${env.tmdbKey}&language=es-ES&page=1`;
  const [mRes, tRes] = await Promise.all([
    fetchWithTimeout(`https://api.themoviedb.org/3/movie/top_rated?${base}`),
    fetchWithTimeout(`https://api.themoviedb.org/3/tv/top_rated?${base}`),
  ]);
  if (!mRes.ok || !tRes.ok) throw new Error('TMDB top_rated error');
  const mData = (await mRes.json()) as { results?: any[] };
  const tData = (await tRes.json()) as { results?: any[] };
  const movies = (mData.results ?? []).slice(0, 10).map((r) => mapWatch(r, 'movie'));
  const tv = (tData.results ?? []).slice(0, 10).map((r) => mapWatch(r, 'tv'));
  return [...movies, ...tv].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 16);
}

// --- Google Places API (New): lugares ---
const PLACE_FIELD_MASK =
  'places.id,places.displayName,places.formattedAddress,places.rating,' +
  'places.userRatingCount,places.photos,places.location,places.googleMapsUri,' +
  'places.primaryTypeDisplayName';

async function mapPlace(p: any): Promise<SearchResult> {
  const photoName: string | undefined = p.photos?.[0]?.name;
  return {
    kind: 'place',
    title: p.displayName?.text ?? 'Lugar',
    subtitle: p.formattedAddress,
    imageUrl: photoName ? await resolvePhoto(photoName) : undefined,
    rating: p.rating,
    externalId: p.id,
    externalUrl: p.googleMapsUri,
    extra: {
      category: p.primaryTypeDisplayName?.text,
      lat: p.location?.latitude,
      lng: p.location?.longitude,
      ratingCount: p.userRatingCount,
    },
  };
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  if (!env.googlePlacesKey) throw new NotConfigured('GOOGLE_PLACES');
  const res = await fetchWithTimeout('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.googlePlacesKey,
      'X-Goog-FieldMask': PLACE_FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: query, languageCode: 'es', maxResultCount: 10 }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Google Places ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { places?: any[] };
  return Promise.all((data.places ?? []).map(mapPlace));
}

// Los ~10 imprescindibles cerca de una ubicacion (atracciones por popularidad).
export async function discoverPlaces(lat: number, lng: number): Promise<SearchResult[]> {
  if (!env.googlePlacesKey) throw new NotConfigured('GOOGLE_PLACES');
  const res = await fetchWithTimeout('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.googlePlacesKey,
      'X-Goog-FieldMask': PLACE_FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: ['tourist_attraction'],
      maxResultCount: 15,
      rankPreference: 'POPULARITY',
      languageCode: 'es',
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius: 20000 },
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Google Places ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { places?: any[] };
  return Promise.all((data.places ?? []).slice(0, 10).map(mapPlace));
}

// Resuelve el nombre de foto de Places a una URL publica (sin exponer la key en el cliente).
async function resolvePhoto(photoName: string): Promise<string | undefined> {
  try {
    const url =
      `https://places.googleapis.com/v1/${photoName}/media` +
      `?maxWidthPx=400&skipHttpRedirect=true&key=${env.googlePlacesKey}`;
    const res = await fetchWithTimeout(url, {}, 6000);
    if (!res.ok) return undefined;
    const data = (await res.json()) as { photoUri?: string };
    return data.photoUri;
  } catch {
    return undefined;
  }
}
