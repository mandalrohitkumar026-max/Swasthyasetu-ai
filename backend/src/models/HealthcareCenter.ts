import mongoose, { Schema, Document } from 'mongoose';

export type CenterType = 'jan_aushadhi' | 'phc' | 'chc' | 'telemedicine_kiosk' | 'district_hospital' | 'diagnostic_lab' | 'uphc' | 'sub_divisional_hospital' | 'pmjay_hospital' | 'government_hub';
export type ResourceCategory = 'clinic' | 'hospital' | 'diagnostic_lab' | 'pharmacy' | 'government_resource';

export interface IPublishedPricing {
  serviceName: string;
  governmentRate: number; // 0 for free
  privateMarketAverageRate: number;
  isSubsidizedOrFree: boolean;
  notes?: string;
}

export interface IHealthcareCenter extends Document {
  name: string;
  category: ResourceCategory;
  type: CenterType;
  address: string;
  district: string;
  state: string;
  pincode: string;
  contactNumber: string;
  operatingHours: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  servicesOffered: string[];
  publishedPricing: IPublishedPricing[];
  accreditations: string[];
  schemesAccepted: string[];
  hasStockAvailable: boolean;
  kioskUptimePercentage: number;
  emergencyCasualtyAvailable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PublishedPricingSchema = new Schema<IPublishedPricing>(
  {
    serviceName: { type: String, required: true },
    governmentRate: { type: Number, required: true, default: 0 },
    privateMarketAverageRate: { type: Number, required: true },
    isSubsidizedOrFree: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const HealthcareCenterSchema = new Schema<IHealthcareCenter>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['clinic', 'hospital', 'diagnostic_lab', 'pharmacy', 'government_resource'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
      index: true,
    },
    contactNumber: {
      type: String,
      default: '1800-180-8080',
    },
    operatingHours: {
      type: String,
      default: '09:00 AM - 07:00 PM',
    },
    coordinates: {
      latitude: { type: Number, default: 27.5706 },
      longitude: { type: Number, default: 80.6776 },
    },
    servicesOffered: {
      type: [String],
      default: ['General OPD', 'Essential Medicines'],
    },
    publishedPricing: {
      type: [PublishedPricingSchema],
      default: [],
    },
    accreditations: {
      type: [String],
      default: ['Govt of India Certified'],
    },
    schemesAccepted: {
      type: [String],
      default: ['Ayushman Bharat (PM-JAY)', 'Free Essential Drugs Scheme'],
    },
    hasStockAvailable: {
      type: Boolean,
      default: true,
    },
    kioskUptimePercentage: {
      type: Number,
      default: 99.4,
    },
    emergencyCasualtyAvailable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-throughput scaling & search
HealthcareCenterSchema.index({ category: 1, district: 1 });
HealthcareCenterSchema.index({ district: 1, isActive: 1 });
HealthcareCenterSchema.index({ name: 'text', address: 'text', district: 'text' });

export const HealthcareCenter =
  mongoose.models.HealthcareCenter || mongoose.model<IHealthcareCenter>('HealthcareCenter', HealthcareCenterSchema);
