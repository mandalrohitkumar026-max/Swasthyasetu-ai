import mongoose, { Schema, Document } from 'mongoose';

export type AppointmentModality = 'hd_video' | 'audio_call' | 'kiosk';
export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type AppointmentUrgency = 'routine' | 'urgent' | 'emergency';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  modality: AppointmentModality;
  chiefComplaint: string;
  urgency: AppointmentUrgency;
  status: AppointmentStatus;
  meetingRoomId: string;
  vitalsBrief?: {
    bp?: string;
    pulse?: number;
    spo2?: number;
    glucose?: number;
  };
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
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
    date: {
      type: String,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    modality: {
      type: String,
      enum: ['hd_video', 'audio_call', 'kiosk'],
      default: 'hd_video',
    },
    chiefComplaint: {
      type: String,
      required: true,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    meetingRoomId: {
      type: String,
      required: true,
      default: () => 'telemed-' + Math.random().toString(36).substring(2, 9),
    },
    vitalsBrief: {
      bp: String,
      pulse: Number,
      spo2: Number,
      glucose: Number,
    },
    cancelReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
