"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.doctorRegisterSchema = exports.patientRegisterSchema = void 0;
const zod_1 = require("zod");
exports.patientRegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address').trim().toLowerCase(),
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits').max(15).trim(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    fullName: zod_1.z.string().min(2, 'Full name is required').trim(),
    gender: zod_1.z.enum(['male', 'female', 'other']).default('other'),
    dateOfBirth: zod_1.z.string().optional(),
    bloodGroup: zod_1.z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']).default('Unknown'),
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
    abhaId: zod_1.z.string().optional(),
});
exports.doctorRegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address').trim().toLowerCase(),
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits').max(15).trim(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    fullName: zod_1.z.string().min(2, 'Full name is required').trim(),
    nmcRegistrationNumber: zod_1.z.string().min(4, 'Valid NMC registration number is required').trim(),
    specialty: zod_1.z.string().min(2, 'Specialty is required').trim(),
    qualifications: zod_1.z.array(zod_1.z.string()).default(['MBBS']),
    experienceYears: zod_1.z.number().nonnegative().default(1),
    languages: zod_1.z.array(zod_1.z.string()).default(['Hindi', 'English']),
    consultationFee: zod_1.z.number().nonnegative().default(0),
    hospitalAffiliation: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    emailOrPhone: zod_1.z.string().min(3, 'Email or Phone is required').trim(),
    password: zod_1.z.string().min(1, 'Password is required'),
});
