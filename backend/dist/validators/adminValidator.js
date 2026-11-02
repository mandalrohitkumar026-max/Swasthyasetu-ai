"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCenterSchema = exports.createCenterSchema = exports.verifyDoctorSchema = exports.updateUserStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateUserStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'suspended', 'pending']),
});
exports.verifyDoctorSchema = zod_1.z.object({
    verificationStatus: zod_1.z.enum(['verified', 'rejected']),
});
exports.createCenterSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Name is required'),
    type: zod_1.z.enum(['jan_aushadhi', 'phc', 'chc', 'telemedicine_kiosk', 'district_hospital']),
    address: zod_1.z.string().min(5, 'Address is required'),
    district: zod_1.z.string().min(2, 'District is required'),
    state: zod_1.z.string().min(2, 'State is required'),
    pincode: zod_1.z.string().regex(/^\d{6}$/, 'Valid 6-digit Indian pincode is required'),
    contactNumber: zod_1.z.string().default('1800-180-8080'),
    operatingHours: zod_1.z.string().default('09:00 AM - 07:00 PM'),
    coordinates: zod_1.z
        .object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    })
        .default({ latitude: 27.5706, longitude: 80.6776 }),
    servicesOffered: zod_1.z.array(zod_1.z.string()).default(['Generic Medicines', 'Teleconsultation']),
    hasStockAvailable: zod_1.z.boolean().default(true),
    kioskUptimePercentage: zod_1.z.number().default(99.4),
});
exports.updateCenterSchema = exports.createCenterSchema.partial();
