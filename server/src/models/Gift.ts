import { Schema, model, Types } from 'mongoose';

export type GiftOccasion = 'birthday' | 'christmas' | 'other';
export type GiftReserveStatus = 'reserved' | 'bought';

export interface IGift {
  _id: Types.ObjectId;
  spaceId: Types.ObjectId;
  ownerId: Types.ObjectId; // quien PIDE el regalo (a quien se lo regalan)
  title: string;
  price?: number;
  url?: string;
  imageUrl?: string;
  occasion: GiftOccasion;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  // Reserva del OTRO miembro (oculta para el dueno: la sorpresa).
  reservedBy?: Types.ObjectId;
  reservedStatus?: GiftReserveStatus;
}

const giftSchema = new Schema<IGift>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number },
    url: { type: String },
    imageUrl: { type: String },
    occasion: { type: String, enum: ['birthday', 'christmas', 'other'], default: 'other' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    notes: { type: String },
    reservedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reservedStatus: { type: String, enum: ['reserved', 'bought'] },
  },
  { timestamps: true }
);

export const Gift = model<IGift>('Gift', giftSchema);
