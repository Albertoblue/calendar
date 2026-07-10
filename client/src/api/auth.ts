import { api } from './client';
import { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  color?: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}
