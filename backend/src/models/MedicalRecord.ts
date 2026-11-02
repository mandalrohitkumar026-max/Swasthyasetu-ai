import mongoose, { Schema, Document } from 'mongoose';

export type MedicalRecordType = 'prescription' | 'lab_report' | 'discharge_summary' | 'triage_assessment' | 'vaccination';

export interface IMedicalRecord extends Document {
  patientId: mongoose.Types.ObjectId;
  recordType: MedicalRecordType;
  title: string;
  description: string;
  doctorName?: string;
  hospitalOrFacility?: string;
  recordDate: string;
  fhirData?: Record<string, any>;
  fileAttachmentUrl?: string;
  tags: string[];
  isAbdmSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    recordType: {
      type: String,
      enum: ['prescription', 'lab_report', 'discharge_summary', 'triage_assessment', 'vaccination'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    doctorName: {
      type: String,
      default: 'Authorized Practitioner',
    },
    hospitalOrFacility: {
      type: String,
      default: 'SwasthyaSetu Health Network',
    },
    recordDate: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split('T')[0],
    },
    fhirData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    fileAttachmentUrl: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    isAbdmSynced: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
