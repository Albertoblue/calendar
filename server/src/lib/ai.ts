import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { NotConfigured } from './providers';

export interface Suggestion {
  title: string;
  description: string;
  category: string;
  estimatedHours: number;
  tip: string;
}

export interface SuggestContext {
  categories: string[];
  moment?: string;
  vibe?: string;
  budget?: string;
  notes?: string;
}

const SYSTEM = [
  'Eres un planificador creativo de citas y planes para parejas.',
  'Respondes SIEMPRE en espanol y UNICAMENTE con un objeto JSON valido:',
  'sin texto antes ni despues, y sin bloques de codigo markdown.',
].join(' ');

function buildPrompt(ctx: SuggestContext): string {
  return [
    'Propon 4 planes de cita variados, concretos y realizables para una pareja.',
    '',
    'Contexto:',
    `- Categorias que suelen usar: ${ctx.categories.join(', ') || 'ninguna en particular'}`,
    `- Momento: ${ctx.moment || 'cualquiera'}`,
    `- Estilo deseado: ${ctx.vibe || 'cualquiera'}`,
    `- Presupuesto: ${ctx.budget || 'cualquiera'}`,
    `- Notas/restricciones: ${ctx.notes || 'ninguna'}`,
    '',
    'Devuelve exactamente este formato JSON:',
    '{"suggestions":[{"title":"...","description":"...","category":"...","estimatedHours":2,"tip":"..."}]}',
    '',
    'Reglas por cada plan:',
    '- title: nombre corto y atractivo.',
    '- description: 1 o 2 frases concretas de que harian.',
    '- category: elige una de las categorias que usan si encaja, o propon una adecuada.',
    '- estimatedHours: numero (puede ser decimal) con la duracion estimada.',
    '- tip: un consejo practico (reserva, que llevar, mejor hora, etc.).',
  ].join('\n');
}

// Extrae el objeto JSON del texto (por si el modelo anade algo alrededor).
function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return start >= 0 && end > start ? text.slice(start, end + 1) : text;
}

export async function suggestPlans(ctx: SuggestContext): Promise<Suggestion[]> {
  if (!env.anthropicKey) throw new NotConfigured('ANTHROPIC');

  const client = new Anthropic({ apiKey: env.anthropicKey });
  const response = await client.messages.create({
    // Modelo por defecto recomendado; cambialo aqui si prefieres otro (p. ej. claude-haiku-4-5).
    model: 'claude-opus-4-8',
    max_tokens: 3000,
    system: SYSTEM,
    messages: [{ role: 'user', content: buildPrompt(ctx) }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  try {
    const parsed = JSON.parse(extractJson(text)) as { suggestions?: Suggestion[] };
    return Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 6) : [];
  } catch {
    console.error('[ai] No se pudo parsear la respuesta del modelo');
    return [];
  }
}
