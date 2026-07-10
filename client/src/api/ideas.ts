import { api } from './client';
import { Idea, IdeaInput, IdeaKind, SearchResult } from '../types';

export async function fetchIdeas(kind: IdeaKind): Promise<Idea[]> {
  const { data } = await api.get<{ ideas: Idea[] }>('/ideas', { params: { kind } });
  return data.ideas;
}

export async function createIdea(payload: IdeaInput): Promise<Idea> {
  const { data } = await api.post<{ idea: Idea }>('/ideas', payload);
  return data.idea;
}

export async function updateIdea(id: string, payload: Partial<IdeaInput>): Promise<Idea> {
  const { data } = await api.patch<{ idea: Idea }>(`/ideas/${id}`, payload);
  return data.idea;
}

export async function deleteIdea(id: string): Promise<void> {
  await api.delete(`/ideas/${id}`);
}

export async function rateIdea(id: string, value: number): Promise<Idea> {
  const { data } = await api.post<{ idea: Idea }>(`/ideas/${id}/rate`, { value });
  return data.idea;
}

interface SearchResponse {
  results: SearchResult[];
  configured: boolean;
}

export async function searchMovies(q: string): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/ideas/search/movies', { params: { q } });
  return data;
}

export async function searchPlaces(q: string): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/ideas/search/places', { params: { q } });
  return data;
}

export async function topRatedWatch(): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/ideas/discover/movies');
  return data;
}

export async function discoverPlaces(lat: number, lng: number): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/ideas/discover/places', {
    params: { lat, lng },
  });
  return data;
}
