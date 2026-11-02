"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthcareCenter = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PublishedPricingSchema = new mongoose_1.Schema({
    serviceName: { type: String, required: true },
    governmentRate: { type: Number, required: true, default: 0 },
    privateMarketAverageRate: { type: Number, required: true },
    isSubsidizedOrFree: { type: Boolean, default: true },
    notes: { type: String, default: '' },
}, { _id: false });
const HealthcareCenterSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
// Compound indexes for high-throughput scaling & search
HealthcareCenterSchema.index({ category: 1, district: 1 });
HealthcareCenterSchema.index({ district: 1, isActive: 1 });
HealthcareCenterSchema.index({ name: 'text', address: 'text', district: 'text' });
exports.HealthcareCenter = mongoose_1.default.models.HealthcareCenter || mongoose_1.default.model('HealthcareCenter', HealthcareCenterSchema);
