import { z } from 'zod';

export const patientRegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15).trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name is required').trim(),
  gender: z.enum(['male', 'female', 'other']).default('other'),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']).default('Unknown'),
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
  abhaId: z.string().optional(),
});

export const doctorRegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15).trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name is required').trim(),
  nmcRegistrationNumber: z.string().min(4, 'Valid NMC registration number is required').trim(),
  specialty: z.string().min(2, 'Specialty is required').trim(),
  qualifications: z.array(z.string()).default(['MBBS']),
  experienceYears: z.number().nonnegative().default(1),
  languages: z.array(z.string()).default(['Hindi', 'English']),
  consultationFee: z.number().nonnegative().default(0),
  hospitalAffiliation: z.string().optional(),
});

export const loginSchema = z.object({
  emailOrPhone: z.string().min(3, 'Email or Phone is required').trim(),
  password: z.string().min(1, 'Password is required'),
});

export type PatientRegisterInput = z.infer<typeof patientRegisterSchema>;
export type DoctorRegisterInput = z.infer<typeof doctorRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
