import { Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Space } from '../models/Space';
import { Category } from '../models/Category';
import { AuthRequest } from '../middleware/auth';
import { makeInviteCode } from '../lib/invite';
import { DEFAULT_CATEGORIES } from '../lib/defaults';
import { emitChange } from '../lib/realtime';

const createSchema = z.object({ name: z.string().min(1, 'El nombre es obligatorio') });

export const createSpace = async (req: AuthRequest, res: Response) => {
  const { name } = createSchema.parse(req.body);
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.spaceId) return res.status(409).json({ error: 'Ya perteneces a un espacio' });

  // Garantiza un codigo de invitacion unico.
  let inviteCode = makeInviteCode();
  while (await Space.exists({ inviteCode })) {
    inviteCode = makeInviteCode();
  }

  const space = await Space.create({ name, members: [user._id], inviteCode });
  user.spaceId = space._id;
  await user.save();

  await Category.insertMany(
    DEFAULT_CATEGORIES.map((c) => ({ ...c, spaceId: space._id }))
  );

  return res.status(201).json({ space });
};

const joinSchema = z.object({ inviteCode: z.string().min(1, 'El codigo es obligatorio') });

export const joinSpace = async (req: AuthRequest, res: Response) => {
  const { inviteCode } = joinSchema.parse(req.body);
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const space = await Space.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
  if (!space) return res.status(404).json({ error: 'Codigo de invitacion invalido' });

  if (!space.members.some((m) => m.equals(user._id))) {
    space.members.push(user._id);
    await space.save();
  }
  user.spaceId = space._id;
  await user.save();

  emitChange(space._id, 'space');
  return res.json({ space });
};

export const currentSpace = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user?.spaceId) {
    return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  }
  const space = await Space.findById(user.spaceId).populate(
    'members',
    'name email color avatarUrl'
  );
  const categories = await Category.find({ spaceId: user.spaceId }).sort({ name: 1 });
  return res.json({ space, categories });
};
