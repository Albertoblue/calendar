import { api } from './client';
import { Category } from '../types';

type CategoryPatch = Partial<{ name: string; color: string; icon: string }>;

export async function updateCategory(id: string, data: CategoryPatch): Promise<Category> {
  const { data: res } = await api.patch<{ category: Category }>(`/categories/${id}`, data);
  return res.category;
}
