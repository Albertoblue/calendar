import { api } from './client';
import { Space, Category } from '../types';

export async function createSpace(name: string): Promise<Space> {
  const { data } = await api.post<{ space: Space }>('/spaces', { name });
  return data.space;
}

export async function joinSpace(inviteCode: string): Promise<Space> {
  const { data } = await api.post<{ space: Space }>('/spaces/join', { inviteCode });
  return data.space;
}

export async function fetchCurrentSpace(): Promise<{ space: Space; categories: Category[] }> {
  const { data } = await api.get<{ space: Space; categories: Category[] }>('/spaces/current');
  return data;
}
