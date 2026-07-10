import { Schema, model, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  color: string;
  avatarUrl?: string;
  spaceId?: Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    color: { type: String, default: '#0F6CBD' },
    avatarUrl: { type: String },
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space' },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
