import mongoose, { Schema, Document } from 'mongoose';

export type FeedbackCategory = 'teleconsultation' | 'ai_triage' | 'kiosk_experience' | 'medicine_availability' | 'general';

export interface IFeedback extends Document {
  userId?: mongoose.Types.ObjectId;
  userRole: string;
  category: FeedbackCategory;
  rating: number;
  comment: string;
  targetId?: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userRole: {
      type: String,
      default: 'patient',
    },
    category: {
      type: String,
      enum: ['teleconsultation', 'ai_triage', 'kiosk_experience', 'medicine_availability', 'general'],
      default: 'general',
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
