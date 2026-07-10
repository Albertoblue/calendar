import { Response } from 'express';
import { z } from 'zod';
import { Types, FilterQuery, UpdateQuery } from 'mongoose';
import { Activity, IActivity } from '../models/Activity';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { expandOccurrences } from '../lib/recurrence';
import { emitChange } from '../lib/realtime';

async function getSpaceId(userId?: string): Promise<Types.ObjectId | null> {
  const user = await User.findById(userId).select('spaceId');
  return user?.spaceId ?? null;
}

const rangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const listActivities = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });

  const { from, to } = rangeSchema.parse(req.query);
  const fromDate = from ? new Date(from) : new Date(-8640000000000000);
  const toDate = to ? new Date(to) : new Date(8640000000000000);

  // Actividades sueltas (no recurrentes) que solapan el rango.
  const singleFilter: FilterQuery<IActivity> = { spaceId, recurrence: null };
  if (from && to) {
    singleFilter.start = { $lte: toDate };
    singleFilter.end = { $gte: fromDate };
  }
  const singles = await Activity.find(singleFilter).sort({ start: 1 }).lean();

  // Maestros recurrentes (inicio <= fin del rango): se expanden al vuelo.
  const masters = await Activity.find({
    spaceId,
    recurrence: { $ne: null },
    start: { $lte: toDate },
  }).lean();
  const occurrences = masters.flatMap((m) =>
    expandOccurrences(m as unknown as IActivity & { _id: Types.ObjectId }, fromDate, toDate)
  );

  return res.json({ activities: [...singles, ...occurrences] });
};

// Lista las actividades ya vividas (status 'done') como recuerdos, mas recientes primero.
export const listMemories = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const activities = await Activity.find({ spaceId, status: 'done' }).sort({ start: -1 });
  return res.json({ activities });
};

// Recuerdos de este mismo dia (mes+dia) en anos anteriores ("En este dia").
export const onThisDay = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const now = new Date();
  const done = await Activity.find({ spaceId, status: 'done' }).sort({ start: -1 });
  const activities = done.filter((a) => {
    const d = new Date(a.start);
    return (
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate() &&
      d.getFullYear() < now.getFullYear()
    );
  });
  return res.json({ activities });
};

const memorySchema = z.object({
  rating: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

const activitySchema = z.object({
  title: z.string().min(1, 'El titulo es obligatorio'),
  description: z.string().optional(),
  location: z.string().optional(),
  start: z.string().datetime({ offset: true }).or(z.string()),
  end: z.string().datetime({ offset: true }).or(z.string()),
  allDay: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
  color: z.string().optional(),
  status: z.enum(['planned', 'done', 'cancelled']).optional(),
  reminders: z.array(z.number().int().min(0)).optional(),
  memory: memorySchema.optional(),
  recurrence: z
    .object({
      freq: z.enum(['daily', 'weekly', 'monthly']),
      interval: z.number().int().min(1).optional(),
      until: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const createActivity = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });

  const data = activitySchema.parse(req.body);
  const activity = await Activity.create({
    ...data,
    categoryId: data.categoryId ? new Types.ObjectId(data.categoryId) : undefined,
    start: new Date(data.start),
    end: new Date(data.end),
    spaceId,
    createdBy: new Types.ObjectId(req.userId),
  });
  emitChange(spaceId, 'activities');
  return res.status(201).json({ activity });
};

export const updateActivity = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });

  const data = activitySchema.partial().parse(req.body);
  const update: UpdateQuery<IActivity> = { ...data };
  const unset: Record<string, 1> = {};
  delete update.categoryId; // se maneja aparte (asignar ObjectId o desasignar)
  delete update.recurrence; // idem
  if (data.start) update.start = new Date(data.start);
  if (data.end) update.end = new Date(data.end);
  if (data.categoryId) update.categoryId = new Types.ObjectId(data.categoryId);
  else if (data.categoryId === '' || data.categoryId === null) unset.categoryId = 1;
  if (data.recurrence) {
    update.recurrence = {
      freq: data.recurrence.freq,
      interval: data.recurrence.interval ?? 1,
      until: data.recurrence.until ? new Date(data.recurrence.until) : undefined,
    };
  } else if (data.recurrence === null) {
    unset.recurrence = 1;
  }
  if (Object.keys(unset).length > 0) update.$unset = unset;

  const activity = await Activity.findOneAndUpdate({ _id: req.params.id, spaceId }, update, {
    new: true,
  });
  if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });
  emitChange(spaceId, 'activities');
  return res.json({ activity });
};

export const deleteActivity = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const deleted = await Activity.findOneAndDelete({ _id: req.params.id, spaceId });
  if (!deleted) return res.status(404).json({ error: 'Actividad no encontrada' });
  emitChange(spaceId, 'activities');
  return res.status(204).end();
};

// --- Recurrencia: operaciones sobre una sola ocurrencia ---

const exceptionSchema = z.object({ occurrenceDate: z.string() });

// Excluye una ocurrencia de la serie (equivale a "borrar solo esta").
export const addException = async (req: AuthRequest, res: Response) => {
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });
  const { occurrenceDate } = exceptionSchema.parse(req.body);
  const master = await Activity.findOneAndUpdate(
    { _id: req.params.id, spaceId },
    { $addToSet: { exceptions: new Date(occurrenceDate) } },
    { new: true }
  );
  if (!master) return res.status(404).json({ error: 'Serie no encontrada' });
  emitChange(spaceId, 'activities');
  return res.json({ activity: master });
};

const detachSchema = activitySchema.partial().extend({ occurrenceDate: z.string() });

// "Editar solo esta": excluye la ocurrencia de la serie y crea una actividad
// suelta (sin recurrencia) con los datos editados.
export const detachOccurrence = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'No autenticado' });
  const spaceId = await getSpaceId(req.userId);
  if (!spaceId) return res.status(404).json({ error: 'No perteneces a ningun espacio' });

  const data = detachSchema.parse(req.body);
  const master = await Activity.findOne({ _id: req.params.id, spaceId });
  if (!master) return res.status(404).json({ error: 'Serie no encontrada' });

  await Activity.updateOne(
    { _id: master._id },
    { $addToSet: { exceptions: new Date(data.occurrenceDate) } }
  );

  const created = await Activity.create({
    spaceId,
    title: data.title ?? master.title,
    description: data.description ?? master.description,
    location: data.location ?? master.location,
    categoryId: data.categoryId ? new Types.ObjectId(data.categoryId) : master.categoryId,
    color: data.color ?? master.color,
    start: data.start ? new Date(data.start) : new Date(data.occurrenceDate),
    end: data.end ? new Date(data.end) : new Date(master.end),
    allDay: data.allDay ?? master.allDay,
    status: data.status ?? 'planned',
    reminders: data.reminders ?? master.reminders,
    memory: data.memory,
    createdBy: new Types.ObjectId(req.userId),
  });

  emitChange(spaceId, 'activities');
  return res.status(201).json({ activity: created });
};
