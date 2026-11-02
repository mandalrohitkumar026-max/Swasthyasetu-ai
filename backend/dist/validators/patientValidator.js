"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicalRecordSchema = exports.logMetricSchema = exports.bookAppointmentSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    gender: zod_1.z.enum(['male', 'female', 'other']).optional(),
    bloodGroup: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    address: zod_1.z
        .object({
        villageOrCity: zod_1.z.string().optional(),
        district: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        pincode: zod_1.z.string().optional(),
    })
        .optional(),
    emergencyContact: zod_1.z
        .object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        relationship: zod_1.z.string().optional(),
    })
        .optional(),
    allergies: zod_1.z.array(zod_1.z.string()).optional(),
    chronicConditions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.bookAppointmentSchema = zod_1.z.object({
    doctorId: zod_1.z.string().min(1, 'Doctor ID is required'),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    timeSlot: zod_1.z.string().min(1, 'Time slot is required'),
    modality: zod_1.z.enum(['hd_video', 'audio_call', 'kiosk']).default('hd_video'),
    chiefComplaint: zod_1.z.string().min(3, 'Chief complaint is required'),
    urgency: zod_1.z.enum(['routine', 'urgent', 'emergency']).default('routine'),
    vitalsBrief: zod_1.z
        .object({
        bp: zod_1.z.string().optional(),
        pulse: zod_1.z.number().optional(),
        spo2: zod_1.z.number().optional(),
        glucose: zod_1.z.number().optional(),
    })
        .optional(),
});
exports.logMetricSchema = zod_1.z.object({
    metricType: zod_1.z.enum(['blood_pressure', 'blood_glucose', 'heart_rate', 'spo2', 'temperature', 'bmi', 'hemoglobin']),
    value: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
    unit: zod_1.z.string().min(1, 'Unit is required'),
    details: zod_1.z
        .object({
        systolic: zod_1.z.number().optional(),
        diastolic: zod_1.z.number().optional(),
        fastingState: zod_1.z.string().optional(),
        note: zod_1.z.string().optional(),
    })
        .optional(),
    measuredBy: zod_1.z.enum(['patient', 'asha_worker', 'kiosk', 'doctor']).default('patient'),
});
exports.createMedicalRecordSchema = zod_1.z.object({
    recordType: zod_1.z.enum(['prescription', 'lab_report', 'discharge_summary', 'triage_assessment', 'vaccination']),
    title: zod_1.z.string().min(3, 'Title is required'),
    description: zod_1.z.string().optional(),
    doctorName: zod_1.z.string().optional(),
    hospitalOrFacility: zod_1.z.string().optional(),
    recordDate: zod_1.z.string().optional(),
    fhirData: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    fileAttachmentUrl: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
});
