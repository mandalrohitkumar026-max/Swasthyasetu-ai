import { z } from 'zod';

export const resourceQuerySchema = z.object({
  category: z.enum(['all', 'clinic', 'hospital', 'diagnostic_lab', 'pharmacy', 'government_resource']).optional(),
  type: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('10').transform(Number),
  sortBy: z.enum(['name', 'district', 'rating', 'distance']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  lite: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
});

export const scheduleFollowUpSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Scheduled date must be YYYY-MM-DD'),
  reason: z.string().min(3, 'Reason for follow-up is required'),
  clinicalGoals: z.array(z.string()).default(['Review recovery parameters']),
});

export const uploadPhotoSchema = z.object({
  imageBase64: z
    .string()
    .min(100, 'Valid base64 image data is required')
    .max(7000000, 'Image payload exceeds 5MB maximum limit')
    .refine(
      (val) => /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(val),
      'Only JPEG, PNG, and WebP images are allowed. SVG and executable formats are prohibited.'
    )
    .refine(
      (val) => !/<script|javascript:|<svg|<\?xml/i.test(val),
      'Potentially malicious scripts or embedded tags detected in image stream.'
    ),
  facilityId: z.string().regex(/^[a-zA-Z0-9_\-]+$/, 'Facility ID contains invalid characters').optional(),
  description: z.string().max(250, 'Description cannot exceed 250 characters').optional(),
});

