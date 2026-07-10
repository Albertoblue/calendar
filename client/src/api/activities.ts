import { api } from './client';
import { Activity, ActivityInput } from '../types';

export async function fetchActivities(from: string, to: string): Promise<Activity[]> {
  const { data } = await api.get<{ activities: Activity[] }>('/activities', {
    params: { from, to },
  });
  return data.activities;
}

export async function fetchMemories(): Promise<Activity[]> {
  const { data } = await api.get<{ activities: Activity[] }>('/activities/memories');
  return data.activities;
}

export async function createActivity(payload: ActivityInput): Promise<Activity> {
  const { data } = await api.post<{ activity: Activity }>('/activities', payload);
  return data.activity;
}

export async function updateActivity(
  id: string,
  payload: Partial<ActivityInput>
): Promise<Activity> {
  const { data } = await api.patch<{ activity: Activity }>(`/activities/${id}`, payload);
  return data.activity;
}

export async function deleteActivity(id: string): Promise<void> {
  await api.delete(`/activities/${id}`);
}

/** Excluye una ocurrencia de una serie recurrente (borrar solo esta). */
export async function addException(masterId: string, occurrenceDate: string): Promise<Activity> {
  const { data } = await api.post<{ activity: Activity }>(`/activities/${masterId}/exceptions`, {
    occurrenceDate,
  });
  return data.activity;
}

/** Desprende una ocurrencia como actividad suelta con datos editados (editar solo esta). */
export async function detachOccurrence(
  masterId: string,
  payload: Partial<ActivityInput> & { occurrenceDate: string }
): Promise<Activity> {
  const { data } = await api.post<{ activity: Activity }>(
    `/activities/${masterId}/detach`,
    payload
  );
  return data.activity;
}
