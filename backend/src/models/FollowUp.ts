import mongoose, { Schema, Document } from 'mongoose';

export type FollowUpStatus = 'scheduled' | 'reminder_sent' | 'completed' | 'missed' | 'cancelled';

export interface IFollowUp extends Document {
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientName: string;
  doctorName: string;
  scheduledDate: string; // YYYY-MM-DD
  reason: string;
  clinicalGoals: string[];
  status: FollowUpStatus;
  recoveryNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    clinicalGoals: {
      type: [String],
      default: ['Review fasting blood sugar', 'Check blood pressure tolerance'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'reminder_sent', 'completed', 'missed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    recoveryNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

FollowUpSchema.index({ patientId: 1, scheduledDate: 1 });
FollowUpSchema.index({ doctorId: 1, scheduledDate: 1 });

export const FollowUp = mongoose.models.FollowUp || mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
