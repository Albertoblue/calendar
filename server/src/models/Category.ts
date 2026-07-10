import { Schema, model, Types } from 'mongoose';

export interface ICategory {
  _id: Types.ObjectId;
  spaceId: Types.ObjectId;
  name: string;
  color: string;
  icon: string;
}

const categorySchema = new Schema<ICategory>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true },
    icon: { type: String, default: '📌' },
  },
  { timestamps: true }
);

export const Category = model<ICategory>('Category', categorySchema);
