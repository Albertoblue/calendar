import { Response } from 'express';
import { z } from 'zod';
import { Category } from '../models/Category';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';
import { emitChange } from '../lib/realtime';

async function getSpaceId(userId?: string): Promise<Types.ObjectId | null> {
  const user = await User.findById(userId).select('spaceId');
  return user?.spaceId ?? null;
}

export const listCategories = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const categories = await Category.find({ spaceId }).sort({ name: 1 });
  return res.json({ categories });
};

const createSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  icon: z.string().optional(),
});

export const createCategory = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const data = createSchema.parse(req.body);
  const category = await Category.create({ ...data, spaceId });
  emitChange(spaceId, 'space');
  return res.status(201).json({ category });
};

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  icon: z.string().optional(),
});

export const updateCategory = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const data = updateSchema.parse(req.body);
  const category = await Category.findOneAndUpdate({ _id: req.params.id, spaceId }, data, {
    new: true,
  });
  if (!category) return res.status(404).json({ error: 'Categoria no encontrada' });
  emitChange(spaceId, 'space');
  return res.json({ category });
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const deleted = await Category.findOneAndDelete({ _id: req.params.id, spaceId });
  if (!deleted) return res.status(404).json({ error: 'Categoria no encontrada' });
  emitChange(spaceId, 'space');
  return res.status(204).end();
};
