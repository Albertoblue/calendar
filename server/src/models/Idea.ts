import { Schema, model, Types } from 'mongoose';

export type IdeaKind = 'place' | 'watch';

export interface IIdeaRating {
  userId: Types.ObjectId;
  value: number;
}

export interface IIdea {
  _id: Types.ObjectId;
  spaceId: Types.ObjectId;
  createdBy: Types.ObjectId;
  kind: IdeaKind;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  rating?: number;
  externalId?: string;
  externalUrl?: string;
  extra?: Record<string, unknown>;
  notes?: string;
  done: boolean;
  // Tracking de series (solo para kind 'watch' de tipo serie):
  progress?: { season: number; episode: number };
  ratings: IIdeaRating[];
}

const ideaSchema = new Schema<IIdea>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: ['place', 'watch'], required: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String },
    imageUrl: { type: String },
    rating: { type: Number },
    externalId: { type: String },
    externalUrl: { type: String },
    extra: { type: Schema.Types.Mixed },
    notes: { type: String },
    done: { type: Boolean, default: false },
    progress: {
      type: new Schema(
        { season: { type: Number, default: 1 }, episode: { type: Number, default: 0 } },
        { _id: false }
      ),
      default: undefined,
    },
    ratings: {
      type: [
        new Schema(
          {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            value: { type: Number, min: 0, max: 5, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Idea = model<IIdea>('Idea', ideaSchema);
