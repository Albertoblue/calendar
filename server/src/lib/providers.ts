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

// --- TMDB: peliculas y series ---
export async function searchMovies(query: string): Promise<SearchResult[]> {
  if (!env.tmdbKey) throw new NotConfigured('TMDB');

  const url =
    `https://api.themoviedb.org/3/search/multi?api_key=${env.tmdbKey}` +
    `&language=es-ES&include_adult=false&query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB respondio ${res.status}`);
  const data = (await res.json()) as { results?: any[] };

  return (data.results ?? [])
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .slice(0, 12)
    .map((r): SearchResult => {
      const isMovie = r.media_type === 'movie';
      const date: string | undefined = isMovie ? r.release_date : r.first_air_date;
      const year = date ? new Date(date).getFullYear() : undefined;
      return {
        kind: 'watch',
        title: isMovie ? r.title : r.name,
        subtitle: `${isMovie ? 'Pelicula' : 'Serie'}${year ? ` · ${year}` : ''}`,
        imageUrl: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : undefined,
        rating: r.vote_average ? Math.round(r.vote_average * 10) / 10 : undefined,
        externalId: String(r.id),
        externalUrl: `https://www.themoviedb.org/${r.media_type}/${r.id}`,
        extra: { mediaType: r.media_type, year, overview: r.overview },
      };
    });
}

// --- Google Places API (New): lugares ---
export async function searchPlaces(query: string): Promise<SearchResult[]> {
  if (!env.googlePlacesKey) throw new NotConfigured('GOOGLE_PLACES');

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.googlePlacesKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,' +
        'places.userRatingCount,places.photos,places.location,places.googleMapsUri,' +
        'places.primaryTypeDisplayName',
    },
    body: JSON.stringify({ textQuery: query, languageCode: 'es', maxResultCount: 10 }),
  });
  if (!res.ok) throw new Error(`Google Places respondio ${res.status}`);
  const data = (await res.json()) as { places?: any[] };

  return Promise.all(
    (data.places ?? []).map(async (p): Promise<SearchResult> => {
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
    })
  );
}

// Resuelve el nombre de foto de Places a una URL publica (sin exponer la key en el cliente).
async function resolvePhoto(photoName: string): Promise<string | undefined> {
  try {
    const url =
      `https://places.googleapis.com/v1/${photoName}/media` +
      `?maxWidthPx=400&skipHttpRedirect=true&key=${env.googlePlacesKey}`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const data = (await res.json()) as { photoUri?: string };
    return data.photoUri;
  } catch {
    return undefined;
  }
}
