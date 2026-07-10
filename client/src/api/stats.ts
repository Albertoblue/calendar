import { api } from './client';
import { Activity, Stats } from '../types';

export async function fetchStats(): Promise<Stats> {
  const { data } = await api.get<Stats>('/stats');
  return data;
}

export async function fetchOnThisDay(): Promise<Activity[]> {
  const { data } = await api.get<{ activities: Activity[] }>('/activities/on-this-day');
  return data.activities;
}
