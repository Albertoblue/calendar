import { api } from './client';
import { Gift, GiftInput } from '../types';

export async function fetchGifts(): Promise<Gift[]> {
  const { data } = await api.get<{ gifts: Gift[] }>('/gifts');
  return data.gifts;
}

export async function createGift(payload: GiftInput): Promise<Gift> {
  const { data } = await api.post<{ gift: Gift }>('/gifts', payload);
  return data.gift;
}

export async function updateGift(id: string, payload: Partial<GiftInput>): Promise<Gift> {
  const { data } = await api.patch<{ gift: Gift }>(`/gifts/${id}`, payload);
  return data.gift;
}

export async function deleteGift(id: string): Promise<void> {
  await api.delete(`/gifts/${id}`);
}

export async function reserveGift(
  id: string,
  status: 'reserved' | 'bought' | 'none'
): Promise<Gift> {
  const { data } = await api.post<{ gift: Gift }>(`/gifts/${id}/reserve`, { status });
  return data.gift;
}
