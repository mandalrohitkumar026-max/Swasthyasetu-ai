import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultationItem {
  medicineName: string;
  genericSalt: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  genericSavingsPercentage?: number;
}

export interface IConsultation extends Document {
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: number;
    spo2?: number;
    glucose?: number;
  };
  chiefComplaint: string;
  clinicalNotes: string;
  symptoms: string[];
  diagnosis: {
    icd10Code?: string;
    condition: string;
  };
  prescription: IConsultationItem[];
  digitalSignature?: {
    signedBy: string;
    nmcNumber: string;
    timestamp: string;
    signatureHash: string;
  };
  followUpDate?: string;
  status: 'scheduled' | 'active' | 'concluded';
  callDurationSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema = new Schema<IConsultation>(
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
    vitals: {
      bp: String,
      pulse: Number,
      temp: Number,
      spo2: Number,
      glucose: Number,
    },
    chiefComplaint: {
      type: String,
      required: true,
    },
    clinicalNotes: {
      type: String,
      default: '',
    },
    symptoms: {
      type: [String],
      default: [],
    },
    diagnosis: {
      icd10Code: { type: String, default: '' },
      condition: { type: String, required: true },
    },
    prescription: [
      {
        medicineName: { type: String, required: true },
        genericSalt: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String, default: '' },
        genericSavingsPercentage: { type: Number, default: 80 },
      },
    ],
    digitalSignature: {
      signedBy: String,
      nmcNumber: String,
      timestamp: String,
      signatureHash: String,
    },
    followUpDate: String,
    status: {
      type: String,
      enum: ['scheduled', 'active', 'concluded'],
      default: 'concluded',
    },
    callDurationSeconds: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Consultation =
  mongoose.models.Consultation || mongoose.model<IConsultation>('Consultation', ConsultationSchema);
