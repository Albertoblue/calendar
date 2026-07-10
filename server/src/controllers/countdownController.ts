import { Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Countdown } from '../models/Countdown';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { emitChange } from '../lib/realtime';

async function getSpaceId(userId?: string): Promise<Types.ObjectId | null> {
  const user = await User.findById(userId).select('spaceId');
  return user?.spaceId ?? null;
}

export const listCountdowns = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const countdowns = await Countdown.find({ spaceId }).sort({ date: 1 });
  return res.json({ countdowns });
};

const countdownSchema = z.object({
  title: z.string().min(1, 'El titulo es obligatorio'),
  date: z.string(),
  icon: z.string().optional(),
  color: z.string().optional(),
  recurring: z.boolean().optional(),
});

export const createCountdown = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const data = countdownSchema.parse(req.body);
  const countdown = await Countdown.create({
    ...data,
    date: new Date(data.date),
    spaceId,
    createdBy: new Types.ObjectId(req.userId),
  });
  emitChange(spaceId, 'countdowns');
  return res.status(201).json({ countdown });
};

export const updateCountdown = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const data = countdownSchema.partial().parse(req.body);
  const update: Record<string, unknown> = { ...data };
  if (data.date) update.date = new Date(data.date);
  const countdown = await Countdown.findOneAndUpdate({ _id: req.params.id, spaceId }, update, {
    new: true,
  });
  if (!countdown) return res.status(404).json({ error: 'Fecha no encontrada' });
  emitChange(spaceId, 'countdowns');
  return res.json({ countdown });
};

export const deleteCountdown = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const deleted = await Countdown.findOneAndDelete({ _id: req.params.id, spaceId });
  if (!deleted) return res.status(404).json({ error: 'Fecha no encontrada' });
  emitChange(spaceId, 'countdowns');
  return res.status(204).end();
};
