import { Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Gift, IGift } from '../models/Gift';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { emitChange } from '../lib/realtime';

async function getSpaceId(userId?: string): Promise<Types.ObjectId | null> {
  const user = await User.findById(userId).select('spaceId');
  return user?.spaceId ?? null;
}

type GiftDoc = IGift & { _id: Types.ObjectId; createdAt?: Date };

/**
 * Serializa un regalo para el cliente. Si el que consulta es el DUENO del regalo,
 * se ocultan los campos de reserva (esa es la sorpresa).
 */
function toClient(g: GiftDoc, requesterId?: string) {
  const isOwn = g.ownerId.toString() === requesterId;
  return {
    _id: g._id.toString(),
    spaceId: g.spaceId.toString(),
    ownerId: g.ownerId.toString(),
    title: g.title,
    price: g.price,
    url: g.url,
    imageUrl: g.imageUrl,
    occasion: g.occasion,
    priority: g.priority,
    notes: g.notes,
    reservedBy: isOwn ? null : g.reservedBy ? g.reservedBy.toString() : null,
    reservedStatus: isOwn ? null : (g.reservedStatus ?? null),
    isOwn,
    createdAt: g.createdAt,
  };
}

export const listGifts = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const gifts = await Gift.find({ spaceId }).sort({ createdAt: -1 }).lean();
  const result = gifts.map((g) => toClient(g as unknown as GiftDoc, req.userId));
  return res.json({ gifts: result });
};

const giftSchema = z.object({
  title: z.string().min(1, 'El titulo es obligatorio'),
  price: z.number().nonnegative().optional(),
  url: z.string().optional(),
  imageUrl: z.string().optional(),
  occasion: z.enum(['birthday', 'christmas', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  notes: z.string().optional(),
});

export const createGift = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const data = giftSchema.parse(req.body);
  const gift = await Gift.create({ ...data, spaceId, ownerId: new Types.ObjectId(req.userId) });
  emitChange(spaceId, 'gifts');
  return res.status(201).json({ gift: toClient(gift.toObject() as unknown as GiftDoc, req.userId) });
};

export const updateGift = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const data = giftSchema.partial().parse(req.body);
  // Solo el dueno puede editar los datos de su regalo.
  const gift = await Gift.findOneAndUpdate(
    { _id: req.params.id, spaceId, ownerId: new Types.ObjectId(req.userId) },
    data,
    { new: true }
  );
  if (!gift) return res.status(404).json({ error: 'Regalo no encontrado' });
  emitChange(spaceId, 'gifts');
  return res.json({ gift: toClient(gift.toObject() as unknown as GiftDoc, req.userId) });
};

export const deleteGift = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const deleted = await Gift.findOneAndDelete({
    _id: req.params.id,
    spaceId,
    ownerId: new Types.ObjectId(req.userId),
  });
  if (!deleted) return res.status(404).json({ error: 'Regalo no encontrado' });
  emitChange(spaceId, 'gifts');
  return res.status(204).end();
};

const reserveSchema = z.object({ status: z.enum(['reserved', 'bought', 'none']) });

export const reserveGift = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });

  const { status } = reserveSchema.parse(req.body);
  const gift = await Gift.findOne({ _id: req.params.id, spaceId });
  if (!gift) return res.status(404).json({ error: 'Regalo no encontrado' });

  // No puedes reservar tu propio regalo (arruinaria tu sorpresa y no te lo regalas tu).
  if (gift.ownerId.toString() === req.userId) {
    return res.status(403).json({ error: 'No puedes reservar tu propio regalo' });
  }
  // Si ya lo reservo otra persona, no se puede tocar.
  if (gift.reservedBy && gift.reservedBy.toString() !== req.userId) {
    return res.status(409).json({ error: 'Ya lo ha reservado otra persona' });
  }

  if (status === 'none') {
    gift.reservedBy = undefined;
    gift.reservedStatus = undefined;
  } else {
    gift.reservedBy = new Types.ObjectId(req.userId);
    gift.reservedStatus = status;
  }
  await gift.save();

  emitChange(spaceId, 'gifts');
  return res.json({ gift: toClient(gift.toObject() as unknown as GiftDoc, req.userId) });
};
