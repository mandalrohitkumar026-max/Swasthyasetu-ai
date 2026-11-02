import { z } from 'zod';

export const updateDoctorProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  specialty: z.string().min(2).optional(),
  qualifications: z.array(z.string()).optional(),
  experienceYears: z.number().nonnegative().optional(),
  languages: z.array(z.string()).optional(),
  consultationFee: z.number().nonnegative().optional(),
  availableSlots: z.array(z.string()).optional(),
  hospitalAffiliation: z.string().optional(),
  bio: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  cancelReason: z.string().optional(),
});

export const createConsultationSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  chiefComplaint: z.string().min(2, 'Chief complaint is required'),
  clinicalNotes: z.string().default(''),
  symptoms: z.array(z.string()).default([]),
  diagnosis: z.object({
    icd10Code: z.string().optional(),
    condition: z.string().min(2, 'Diagnosis condition is required'),
  }),
  prescription: z.array(
    z.object({
      medicineName: z.string().min(1, 'Medicine name is required'),
      genericSalt: z.string().min(1, 'Generic salt is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      frequency: z.string().min(1, 'Frequency is required'),
      duration: z.string().min(1, 'Duration is required'),
      instructions: z.string().default(''),
      genericSavingsPercentage: z.number().default(80),
    })
  ),
  vitals: z
    .object({
      bp: z.string().optional(),
      pulse: z.number().optional(),
      temp: z.number().optional(),
      spo2: z.number().optional(),
      glucose: z.number().optional(),
    })
    .optional(),
  followUpDate: z.string().optional(),
  callDurationSeconds: z.number().nonnegative().default(0),
});
