import mongoose, { Schema, Document } from 'mongoose';

export type DoctorVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  nmcRegistrationNumber: string;
  specialty: string;
  qualifications: string[];
  experienceYears: number;
  languages: string[];
  consultationFee: number;
  availableSlots: string[];
  verificationStatus: DoctorVerificationStatus;
  hospitalAffiliation: string;
  rating: number;
  reviewCount: number;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    nmcRegistrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    qualifications: {
      type: [String],
      default: ['MBBS'],
    },
    experienceYears: {
      type: Number,
      default: 1,
    },
    languages: {
      type: [String],
      default: ['Hindi', 'English'],
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    availableSlots: {
      type: [String],
      default: ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    hospitalAffiliation: {
      type: String,
      default: 'SwasthyaSetu Telehealth Network',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
