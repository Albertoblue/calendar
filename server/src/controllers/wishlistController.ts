import { Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { WishlistItem } from '../models/Wishlist';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { emitChange } from '../lib/realtime';

async function getSpaceId(userId?: string): Promise<Types.ObjectId | null> {
  const user = await User.findById(userId).select('spaceId');
  return user?.spaceId ?? null;
}

export const listWishlist = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const items = await WishlistItem.find({ spaceId }).sort({ done: 1, createdAt: -1 });
  return res.json({ items });
};

const createSchema = z.object({
  title: z.string().min(1, 'El titulo es obligatorio'),
  description: z.string().optional(),
  location: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  color: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  done: z.boolean().optional(),
});

export const createWish = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });

  const data = createSchema.parse(req.body);
  const item = await WishlistItem.create({
    ...data,
    categoryId: data.categoryId ? new Types.ObjectId(data.categoryId) : undefined,
    spaceId,
    createdBy: new Types.ObjectId(req.userId),
  });
  emitChange(spaceId, 'wishlist');
  return res.status(201).json({ item });
};

export const updateWish = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });

  const data = createSchema.partial().parse(req.body);
  const update: Record<string, unknown> = { ...data };
  delete update.categoryId;
  if (data.categoryId) update.categoryId = new Types.ObjectId(data.categoryId);
  else if (data.categoryId === '' || data.categoryId === null) update.$unset = { categoryId: 1 };

  const item = await WishlistItem.findOneAndUpdate({ _id: req.params.id, spaceId }, update, {
    new: true,
  });
  if (!item) return res.status(404).json({ error: 'Deseo no encontrado' });
  emitChange(spaceId, 'wishlist');
  return res.json({ item });
};

export const deleteWish = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const deleted = await WishlistItem.findOneAndDelete({ _id: req.params.id, spaceId });
  if (!deleted) return res.status(404).json({ error: 'Deseo no encontrado' });
  emitChange(spaceId, 'wishlist');
  return res.status(204).end();
};

const scheduleSchema = z.object({
  start: z.string(),
  end: z.string(),
  allDay: z.boolean().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  color: z.string().optional(),
});

/**
 * Convierte un deseo en una actividad del calendario y lo elimina de la lista.
 * El body puede sobreescribir cualquier campo (util cuando se agenda desde el
 * dialogo); si no viene, se usa el valor del deseo (util al arrastrar al slot).
 */
export const scheduleWish = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });

  const wish = await WishlistItem.findOne({ _id: req.params.id, spaceId });
  if (!wish) return res.status(404).json({ error: 'Deseo no encontrado' });

  const body = scheduleSchema.parse(req.body);
  const categoryId =
    body.categoryId !== undefined
      ? body.categoryId
        ? new Types.ObjectId(body.categoryId)
        : undefined
      : wish.categoryId;

  const activity = await Activity.create({
    spaceId,
    title: body.title ?? wish.title,
    description: body.description ?? wish.description,
    location: body.location ?? wish.location,
    categoryId,
    color: body.color ?? wish.color,
    start: new Date(body.start),
    end: new Date(body.end),
    allDay: body.allDay ?? false,
    createdBy: new Types.ObjectId(req.userId),
    status: 'planned',
  });

  await wish.deleteOne();
  emitChange(spaceId, 'wishlist');
  emitChange(spaceId, 'activities');
  return res.status(201).json({ activity });
};
