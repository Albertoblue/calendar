import { Response } from 'express';
import { z } from 'zod';
import { Types, FilterQuery } from 'mongoose';
import { Idea, IIdea } from '../models/Idea';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { searchMovies, searchPlaces, NotConfigured } from '../lib/providers';
import { emitChange } from '../lib/realtime';

async function getSpaceId(userId?: string): Promise<Types.ObjectId | null> {
  const user = await User.findById(userId).select('spaceId');
  return user?.spaceId ?? null;
}

export const listIdeas = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const filter: FilterQuery<IIdea> = { spaceId };
  const kind = req.query.kind;
  if (kind === 'place' || kind === 'watch') filter.kind = kind;
  const ideas = await Idea.find(filter).sort({ done: 1, createdAt: -1 });
  return res.json({ ideas });
};

const ideaSchema = z.object({
  kind: z.enum(['place', 'watch']),
  title: z.string().min(1, 'El titulo es obligatorio'),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  rating: z.number().optional(),
  externalId: z.string().optional(),
  externalUrl: z.string().optional(),
  extra: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
  done: z.boolean().optional(),
  progress: z
    .object({ season: z.number().int().min(0), episode: z.number().int().min(0) })
    .optional(),
});

export const createIdea = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const data = ideaSchema.parse(req.body);
  const idea = await Idea.create({
    ...data,
    spaceId,
    createdBy: new Types.ObjectId(req.userId),
  });
  emitChange(spaceId, 'ideas');
  return res.status(201).json({ idea });
};

export const updateIdea = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const data = ideaSchema.partial().parse(req.body);
  const idea = await Idea.findOneAndUpdate({ _id: req.params.id, spaceId }, data, { new: true });
  if (!idea) return res.status(404).json({ error: 'Idea no encontrada' });
  emitChange(spaceId, 'ideas');
  return res.json({ idea });
};

export const deleteIdea = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const deleted = await Idea.findOneAndDelete({ _id: req.params.id, spaceId });
  if (!deleted) return res.status(404).json({ error: 'Idea no encontrada' });
  emitChange(spaceId, 'ideas');
  return res.status(204).end();
};

// Valoracion de una serie/peli por el usuario actual (una por persona).
const rateSchema = z.object({ value: z.number().min(0).max(5) });

export const rateIdea = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const { value } = rateSchema.parse(req.body);
  const userId = new Types.ObjectId(req.userId);

  const idea = await Idea.findOne({ _id: req.params.id, spaceId });
  if (!idea) return res.status(404).json({ error: 'Idea no encontrada' });
  idea.ratings = idea.ratings.filter((r) => !r.userId.equals(userId));
  idea.ratings.push({ userId, value });
  await idea.save();

  emitChange(spaceId, 'ideas');
  return res.json({ idea });
};

// --- Busqueda en APIs externas (proxy; la key nunca llega al cliente) ---
const searchQuery = z.object({ q: z.string().min(1) });

export const searchMoviesCtrl = async (req: AuthRequest, res: Response) => {
  const { q } = searchQuery.parse(req.query);
  try {
    const results = await searchMovies(q);
    return res.json({ results, configured: true });
  } catch (err) {
    if (err instanceof NotConfigured) return res.json({ results: [], configured: false });
    throw err;
  }
};

export const searchPlacesCtrl = async (req: AuthRequest, res: Response) => {
  const { q } = searchQuery.parse(req.query);
  try {
    const results = await searchPlaces(q);
    return res.json({ results, configured: true });
  } catch (err) {
    if (err instanceof NotConfigured) return res.json({ results: [], configured: false });
    throw err;
  }
};
