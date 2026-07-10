import { Schema, model, Types } from 'mongoose';

export type ActivityStatus = 'planned' | 'done' | 'cancelled';
export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly';

export interface IMemory {
  rating?: number;
  notes?: string;
  photos?: string[];
}

export interface IRecurrence {
  freq: RecurrenceFreq;
  interval: number;
  until?: Date;
}

export interface IActivity {
  _id: Types.ObjectId;
  spaceId: Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  categoryId?: Types.ObjectId;
  color: string;
  createdBy: Types.ObjectId;
  status: ActivityStatus;
  reminders: number[];
  memory?: IMemory;
  recurrence?: IRecurrence;
  exceptions: Date[];
}

const memorySchema = new Schema<IMemory>(
  {
    rating: { type: Number, min: 0, max: 5 },
    notes: { type: String },
    photos: [{ type: String }],
  },
  { _id: false }
);

const recurrenceSchema = new Schema<IRecurrence>(
  {
    freq: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    interval: { type: Number, default: 1, min: 1 },
    until: { type: Date },
  },
  { _id: false }
);

const activitySchema = new Schema<IActivity>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    location: { type: String },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    color: { type: String, default: '#0F6CBD' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['planned', 'done', 'cancelled'], default: 'planned' },
    // Minutos antes del inicio en que hay que avisar (p. ej. [10, 60]).
    reminders: { type: [Number], default: [] },
    memory: { type: memorySchema, default: undefined },
    // Si esta presente, esta actividad es el "maestro" de una serie recurrente.
    recurrence: { type: recurrenceSchema, default: undefined },
    // Fechas de inicio de ocurrencias excluidas (borradas o desprendidas).
    exceptions: { type: [Date], default: [] },
  },
  { timestamps: true }
);

// Indice para consultas por rango de fechas dentro de un espacio.
activitySchema.index({ spaceId: 1, start: 1, end: 1 });

export const Activity = model<IActivity>('Activity', activitySchema);
