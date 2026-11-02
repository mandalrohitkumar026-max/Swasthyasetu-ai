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
exports.Doctor = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DoctorSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    nmcRegistrationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    specialty: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    qualifications: {
        type: [String],
        default: ['MBBS'],
    },
    experienceYears: {
        type: Number,
        default: 1,
    },
    languages: {
        type: [String],
        default: ['Hindi', 'English'],
    },
    consultationFee: {
        type: Number,
        default: 0,
    },
    availableSlots: {
        type: [String],
        default: ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
        index: true,
    },
    hospitalAffiliation: {
        type: String,
        default: 'SwasthyaSetu Telehealth Network',
    },
    rating: {
        type: Number,
        default: 4.8,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
    bio: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});
exports.Doctor = mongoose_1.default.models.Doctor || mongoose_1.default.model('Doctor', DoctorSchema);
