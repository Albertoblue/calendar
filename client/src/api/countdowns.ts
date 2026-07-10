import { api } from './client';
import { Countdown, CountdownInput } from '../types';

export async function fetchCountdowns(): Promise<Countdown[]> {
  const { data } = await api.get<{ countdowns: Countdown[] }>('/countdowns');
  return data.countdowns;
}

export async function createCountdown(payload: CountdownInput): Promise<Countdown> {
  const { data } = await api.post<{ countdown: Countdown }>('/countdowns', payload);
  return data.countdown;
}

export async function updateCountdown(
  id: string,
  payload: Partial<CountdownInput>
): Promise<Countdown> {
  const { data } = await api.patch<{ countdown: Countdown }>(`/countdowns/${id}`, payload);
  return data.countdown;
}

export async function deleteCountdown(id: string): Promise<void> {
  await api.delete(`/countdowns/${id}`);
}
