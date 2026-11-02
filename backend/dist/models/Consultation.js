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
exports.Consultation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ConsultationSchema = new mongoose_1.Schema({
    appointmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        index: true,
    },
    patientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        index: true,
    },
    doctorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
        index: true,
    },
    vitals: {
        bp: String,
        pulse: Number,
        temp: Number,
        spo2: Number,
        glucose: Number,
    },
    chiefComplaint: {
        type: String,
        required: true,
    },
    clinicalNotes: {
        type: String,
        default: '',
    },
    symptoms: {
        type: [String],
        default: [],
    },
    diagnosis: {
        icd10Code: { type: String, default: '' },
        condition: { type: String, required: true },
    },
    prescription: [
        {
            medicineName: { type: String, required: true },
            genericSalt: { type: String, required: true },
            dosage: { type: String, required: true },
            frequency: { type: String, required: true },
            duration: { type: String, required: true },
            instructions: { type: String, default: '' },
            genericSavingsPercentage: { type: Number, default: 80 },
        },
    ],
    digitalSignature: {
        signedBy: String,
        nmcNumber: String,
        timestamp: String,
        signatureHash: String,
    },
    followUpDate: String,
    status: {
        type: String,
        enum: ['scheduled', 'active', 'concluded'],
        default: 'concluded',
    },
    callDurationSeconds: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
exports.Consultation = mongoose_1.default.models.Consultation || mongoose_1.default.model('Consultation', ConsultationSchema);
