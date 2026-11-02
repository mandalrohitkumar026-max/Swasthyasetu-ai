import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'pending']),
});

export const verifyDoctorSchema = z.object({
  verificationStatus: z.enum(['verified', 'rejected']),
});

export const createCenterSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  type: z.enum(['jan_aushadhi', 'phc', 'chc', 'telemedicine_kiosk', 'district_hospital']),
  address: z.string().min(5, 'Address is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit Indian pincode is required'),
  contactNumber: z.string().default('1800-180-8080'),
  operatingHours: z.string().default('09:00 AM - 07:00 PM'),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .default({ latitude: 27.5706, longitude: 80.6776 }),
  servicesOffered: z.array(z.string()).default(['Generic Medicines', 'Teleconsultation']),
  hasStockAvailable: z.boolean().default(true),
  kioskUptimePercentage: z.number().default(99.4),
});

export const updateCenterSchema = createCenterSchema.partial();
