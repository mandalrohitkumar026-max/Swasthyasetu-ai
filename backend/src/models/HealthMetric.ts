import mongoose, { Schema, Document } from 'mongoose';

export type MetricType = 'blood_pressure' | 'blood_glucose' | 'heart_rate' | 'spo2' | 'temperature' | 'bmi' | 'hemoglobin';
export type MetricStatus = 'normal' | 'elevated' | 'high' | 'critical';
export type MeasuredBy = 'patient' | 'asha_worker' | 'kiosk' | 'doctor';

export interface IHealthMetric extends Document {
  patientId: mongoose.Types.ObjectId;
  metricType: MetricType;
  value: string | number;
  details?: {
    systolic?: number;
    diastolic?: number;
    fastingState?: string;
    note?: string;
  };
  unit: string;
  status: MetricStatus;
  recordedAt: Date;
  measuredBy: MeasuredBy;
  createdAt: Date;
}

const HealthMetricSchema = new Schema<IHealthMetric>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    metricType: {
      type: String,
      enum: ['blood_pressure', 'blood_glucose', 'heart_rate', 'spo2', 'temperature', 'bmi', 'hemoglobin'],
      required: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    details: {
      systolic: Number,
      diastolic: Number,
      fastingState: String,
      note: String,
    },
    unit: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['normal', 'elevated', 'high', 'critical'],
      default: 'normal',
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    measuredBy: {
      type: String,
      enum: ['patient', 'asha_worker', 'kiosk', 'doctor'],
      default: 'patient',
    },
  },
  {
    timestamps: true,
  }
);

export const HealthMetric = mongoose.models.HealthMetric || mongoose.model<IHealthMetric>('HealthMetric', HealthMetricSchema);
