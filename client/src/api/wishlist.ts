import { api } from './client';
import { Activity, WishlistItem, WishInput, ScheduleWishInput } from '../types';

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const { data } = await api.get<{ items: WishlistItem[] }>('/wishlist');
  return data.items;
}

export async function createWish(payload: WishInput): Promise<WishlistItem> {
  const { data } = await api.post<{ item: WishlistItem }>('/wishlist', payload);
  return data.item;
}

export async function updateWish(id: string, payload: Partial<WishInput>): Promise<WishlistItem> {
  const { data } = await api.patch<{ item: WishlistItem }>(`/wishlist/${id}`, payload);
  return data.item;
}

export async function deleteWish(id: string): Promise<void> {
  await api.delete(`/wishlist/${id}`);
}

export async function scheduleWish(id: string, payload: ScheduleWishInput): Promise<Activity> {
  const { data } = await api.post<{ activity: Activity }>(`/wishlist/${id}/schedule`, payload);
  return data.activity;
}
