import { Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { AuthRequest } from '../middleware/auth';
import { suggestPlans } from '../lib/ai';
import { NotConfigured } from '../lib/providers';

const schema = z.object({
  moment: z.string().optional(),
  vibe: z.string().optional(),
  budget: z.string().optional(),
  notes: z.string().optional(),
});

export const suggest = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('spaceId');
  if (!user?.spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });

  const data = schema.parse(req.body);
  const categories = await Category.find({ spaceId: user.spaceId }).select('name');

  try {
    const suggestions = await suggestPlans({
      categories: categories.map((c) => c.name),
      moment: data.moment,
      vibe: data.vibe,
      budget: data.budget,
      notes: data.notes,
    });
    return res.json({ suggestions, configured: true });
  } catch (err) {
    if (err instanceof NotConfigured) return res.json({ suggestions: [], configured: false });
    throw err;
  }
};
