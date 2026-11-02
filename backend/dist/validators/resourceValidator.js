"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhotoSchema = exports.scheduleFollowUpSchema = exports.resourceQuerySchema = void 0;
const zod_1 = require("zod");
exports.resourceQuerySchema = zod_1.z.object({
    category: zod_1.z.enum(['all', 'clinic', 'hospital', 'diagnostic_lab', 'pharmacy', 'government_resource']).optional(),
    type: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.string().regex(/^\d+$/).default('1').transform(Number),
    limit: zod_1.z.string().regex(/^\d+$/).default('10').transform(Number),
    sortBy: zod_1.z.enum(['name', 'district', 'rating', 'distance']).default('name'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
    lite: zod_1.z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
});
exports.scheduleFollowUpSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().min(1, 'Appointment ID is required'),
    patientId: zod_1.z.string().min(1, 'Patient ID is required'),
    doctorId: zod_1.z.string().min(1, 'Doctor ID is required'),
    scheduledDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Scheduled date must be YYYY-MM-DD'),
    reason: zod_1.z.string().min(3, 'Reason for follow-up is required'),
    clinicalGoals: zod_1.z.array(zod_1.z.string()).default(['Review recovery parameters']),
});
exports.uploadPhotoSchema = zod_1.z.object({
    imageBase64: zod_1.z
        .string()
        .min(100, 'Valid base64 image data is required')
        .max(7000000, 'Image payload exceeds 5MB maximum limit')
        .refine((val) => /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(val), 'Only JPEG, PNG, and WebP images are allowed. SVG and executable formats are prohibited.')
        .refine((val) => !/<script|javascript:|<svg|<\?xml/i.test(val), 'Potentially malicious scripts or embedded tags detected in image stream.'),
    facilityId: zod_1.z.string().regex(/^[a-zA-Z0-9_\-]+$/, 'Facility ID contains invalid characters').optional(),
    description: zod_1.z.string().max(250, 'Description cannot exceed 250 characters').optional(),
});
