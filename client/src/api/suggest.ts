import { api } from './client';
import { Suggestion, SuggestInput } from '../types';

export async function suggestPlans(
  payload: SuggestInput
): Promise<{ suggestions: Suggestion[]; configured: boolean }> {
  const { data } = await api.post<{ suggestions: Suggestion[]; configured: boolean }>(
    '/suggest',
    payload
  );
  return data;
}
