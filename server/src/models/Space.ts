import { Schema, model, Types } from 'mongoose';

export interface ISpace {
  _id: Types.ObjectId;
  name: string;
  members: Types.ObjectId[];
  inviteCode: string;
}

const spaceSchema = new Schema<ISpace>(
  {
    name: { type: String, required: true, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: { type: String, required: true, unique: true, uppercase: true },
  },
  { timestamps: true }
);

export const Space = model<ISpace>('Space', spaceSchema);
