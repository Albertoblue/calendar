import { Schema, model, Types } from 'mongoose';

export type WishPriority = 'low' | 'medium' | 'high';

export interface IWishlistItem {
  _id: Types.ObjectId;
  spaceId: Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  categoryId?: Types.ObjectId;
  color: string;
  createdBy: Types.ObjectId;
  priority: WishPriority;
  done: boolean;
}

const wishlistSchema = new Schema<IWishlistItem>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    location: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    color: { type: String, default: '#0F6CBD' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const WishlistItem = model<IWishlistItem>('WishlistItem', wishlistSchema);
