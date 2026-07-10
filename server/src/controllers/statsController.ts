import { Response } from 'express';
import { Types } from 'mongoose';
import { Activity } from '../models/Activity';
import { Idea } from '../models/Idea';
import { Category } from '../models/Category';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

async function getSpaceId(userId?: string): Promise<Types.ObjectId | null> {
  const user = await User.findById(userId).select('spaceId');
  return user?.spaceId ?? null;
}

export const getStats = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });

  const [totalActivities, memories, places, placesVisited, watchlist, catAgg, monthAgg, categories] =
    await Promise.all([
      Activity.countDocuments({ spaceId }),
      Activity.countDocuments({ spaceId, status: 'done' }),
      Idea.countDocuments({ spaceId, kind: 'place' }),
      Idea.countDocuments({ spaceId, kind: 'place', done: true }),
      Idea.countDocuments({ spaceId, kind: 'watch' }),
      Activity.aggregate([
        { $match: { spaceId } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      ]),
      Activity.aggregate([
        { $match: { spaceId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$start' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Category.find({ spaceId }),
    ]);

  const catMap = new Map(
    categories.map((c) => [c._id.toString(), { name: c.name, color: c.color }])
  );
  const byCategory = (catAgg as { _id: Types.ObjectId | null; count: number }[])
    .map((row) => {
      const cat = row._id ? catMap.get(row._id.toString()) : undefined;
      return {
        name: cat?.name ?? 'Sin categoria',
        color: cat?.color ?? '#5C6773',
        count: row.count,
      };
    })
    .sort((a, b) => b.count - a.count);

  const byMonth = (monthAgg as { _id: string; count: number }[])
    .map((row) => ({ month: row._id, count: row.count }))
    .slice(-12);

  return res.json({
    totalActivities,
    memories,
    places,
    placesVisited,
    watchlist,
    byCategory,
    byMonth,
  });
};
