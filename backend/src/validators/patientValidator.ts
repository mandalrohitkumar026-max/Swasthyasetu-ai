import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  bloodGroup: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z
    .object({
      villageOrCity: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    })
    .optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
});

export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  modality: z.enum(['hd_video', 'audio_call', 'kiosk']).default('hd_video'),
  chiefComplaint: z.string().min(3, 'Chief complaint is required'),
  urgency: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
  vitalsBrief: z
    .object({
      bp: z.string().optional(),
      pulse: z.number().optional(),
      spo2: z.number().optional(),
      glucose: z.number().optional(),
    })
    .optional(),
});

export const logMetricSchema = z.object({
  metricType: z.enum(['blood_pressure', 'blood_glucose', 'heart_rate', 'spo2', 'temperature', 'bmi', 'hemoglobin']),
  value: z.union([z.number(), z.string()]),
  unit: z.string().min(1, 'Unit is required'),
  details: z
    .object({
      systolic: z.number().optional(),
      diastolic: z.number().optional(),
      fastingState: z.string().optional(),
      note: z.string().optional(),
    })
    .optional(),
  measuredBy: z.enum(['patient', 'asha_worker', 'kiosk', 'doctor']).default('patient'),
});

export const createMedicalRecordSchema = z.object({
  recordType: z.enum(['prescription', 'lab_report', 'discharge_summary', 'triage_assessment', 'vaccination']),
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  doctorName: z.string().optional(),
  hospitalOrFacility: z.string().optional(),
  recordDate: z.string().optional(),
  fhirData: z.record(z.string(), z.any()).optional(),
  fileAttachmentUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
