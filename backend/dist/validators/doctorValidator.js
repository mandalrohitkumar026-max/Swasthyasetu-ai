"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsultationSchema = exports.updateAppointmentStatusSchema = exports.updateDoctorProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateDoctorProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    specialty: zod_1.z.string().min(2).optional(),
    qualifications: zod_1.z.array(zod_1.z.string()).optional(),
    experienceYears: zod_1.z.number().nonnegative().optional(),
    languages: zod_1.z.array(zod_1.z.string()).optional(),
    consultationFee: zod_1.z.number().nonnegative().optional(),
    availableSlots: zod_1.z.array(zod_1.z.string()).optional(),
    hospitalAffiliation: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
});
exports.updateAppointmentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
    cancelReason: zod_1.z.string().optional(),
});
exports.createConsultationSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().min(1, 'Appointment ID is required'),
    patientId: zod_1.z.string().min(1, 'Patient ID is required'),
    chiefComplaint: zod_1.z.string().min(2, 'Chief complaint is required'),
    clinicalNotes: zod_1.z.string().default(''),
    symptoms: zod_1.z.array(zod_1.z.string()).default([]),
    diagnosis: zod_1.z.object({
        icd10Code: zod_1.z.string().optional(),
        condition: zod_1.z.string().min(2, 'Diagnosis condition is required'),
    }),
    prescription: zod_1.z.array(zod_1.z.object({
        medicineName: zod_1.z.string().min(1, 'Medicine name is required'),
        genericSalt: zod_1.z.string().min(1, 'Generic salt is required'),
        dosage: zod_1.z.string().min(1, 'Dosage is required'),
        frequency: zod_1.z.string().min(1, 'Frequency is required'),
        duration: zod_1.z.string().min(1, 'Duration is required'),
        instructions: zod_1.z.string().default(''),
        genericSavingsPercentage: zod_1.z.number().default(80),
    })),
    vitals: zod_1.z
        .object({
        bp: zod_1.z.string().optional(),
        pulse: zod_1.z.number().optional(),
        temp: zod_1.z.number().optional(),
        spo2: zod_1.z.number().optional(),
        glucose: zod_1.z.number().optional(),
    })
        .optional(),
    followUpDate: zod_1.z.string().optional(),
    callDurationSeconds: zod_1.z.number().nonnegative().default(0),
});
