import { Schema, model, Types } from 'mongoose';

export interface ICountdown {
  _id: Types.ObjectId;
  spaceId: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  date: Date;
  icon: string;
  color: string;
  recurring: boolean;
}

const countdownSchema = new Schema<ICountdown>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    icon: { type: String, default: '❤️' },
    color: { type: String, default: '#E3008C' },
    // Si es anual (aniversario, cumpleanos): se calcula la proxima ocurrencia.
    recurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Countdown = model<ICountdown>('Countdown', countdownSchema);
