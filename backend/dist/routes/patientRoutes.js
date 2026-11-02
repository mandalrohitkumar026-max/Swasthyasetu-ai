"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const patientValidator_1 = require("../validators/patientValidator");
const db_1 = require("../config/db");
const models_1 = require("../models");
const store_1 = require("../services/store");
const router = (0, express_1.Router)();
// Middleware: all routes here require a logged-in patient
router.use(auth_1.authenticateToken);
router.use((0, auth_1.requireRole)(['patient', 'admin']));
// Helper to resolve patient profile from authenticated user
const getPatientProfile = async (userId) => {
    if (db_1.isDbConnected) {
        return await models_1.Patient.findOne({ userId });
    }
    return store_1.memoryStore.patients.find((p) => p.userId.toString() === userId.toString());
};
// 1. GET /me - Patient Profile
router.get('/me', async (req, res) => {
    try {
        const patient = await getPatientProfile(req.user.userId);
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient profile not found' });
        }
        return res.json({ success: true, data: patient });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 2. PUT /me - Update Patient Profile
router.put('/me', (0, validate_1.validateBody)(patientValidator_1.updateProfileSchema), async (req, res) => {
    try {
        const updates = req.body;
        if (db_1.isDbConnected) {
            const patient = await models_1.Patient.findOneAndUpdate({ userId: req.user.userId }, { $set: updates }, { new: true });
            return res.json({ success: true, message: 'Profile updated successfully', data: patient });
        }
        else {
            const patient = store_1.memoryStore.patients.find((p) => p.userId.toString() === req.user.userId.toString());
            if (!patient) {
                return res.status(404).json({ success: false, error: 'Patient profile not found' });
            }
            Object.assign(patient, updates, { updatedAt: new Date() });
            return res.json({ success: true, message: 'Profile updated successfully', data: patient });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 3. GET /medical-records
router.get('/medical-records', async (req, res) => {
    try {
        const patient = await getPatientProfile(req.user.userId);
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient profile not found' });
        }
        if (db_1.isDbConnected) {
            const records = await models_1.MedicalRecord.find({ patientId: patient._id }).sort({ createdAt: -1 });
            return res.json({ success: true, data: records });
        }
        else {
            const records = store_1.memoryStore.medicalRecords.filter((r) => r.patientId.toString() === patient._id.toString());
            return res.json({ success: true, data: records });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 4. POST /medical-records
router.post('/medical-records', (0, validate_1.validateBody)(patientValidator_1.createMedicalRecordSchema), async (req, res) => {
    try {
        const patient = await getPatientProfile(req.user.userId);
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient profile not found' });
        }
        const recordData = {
            ...req.body,
            patientId: patient._id,
            isAbdmSynced: false,
        };
        if (db_1.isDbConnected) {
            const record = await models_1.MedicalRecord.create(recordData);
            return res.status(201).json({ success: true, message: 'Record added successfully', data: record });
        }
        else {
            const record = {
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                ...recordData,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            store_1.memoryStore.medicalRecords.unshift(record);
            return res.status(201).json({ success: true, message: 'Record added successfully', data: record });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 5. GET /appointments
router.get('/appointments', async (req, res) => {
    try {
        const patient = await getPatientProfile(req.user.userId);
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient profile not found' });
        }
        if (db_1.isDbConnected) {
            const appointments = await models_1.Appointment.find({ patientId: patient._id })
                .populate('doctorId', 'fullName specialty hospitalAffiliation')
                .sort({ date: -1, createdAt: -1 });
            return res.json({ success: true, data: appointments });
        }
        else {
            const appointments = store_1.memoryStore.appointments.filter((a) => a.patientId.toString() === patient._id.toString());
            return res.json({ success: true, data: appointments });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 6. POST /appointments - Book Appointment
router.post('/appointments', (0, validate_1.validateBody)(patientValidator_1.bookAppointmentSchema), async (req, res) => {
    try {
        const patient = await getPatientProfile(req.user.userId);
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient profile not found' });
        }
        const { doctorId, date, timeSlot, modality, chiefComplaint, urgency, vitalsBrief } = req.body;
        // Verify doctor exists
        let doctor = null;
        if (db_1.isDbConnected) {
            doctor = await models_1.Doctor.findById(doctorId);
        }
        else {
            doctor = store_1.memoryStore.doctors.find((d) => d._id.toString() === doctorId.toString());
        }
        const doctorName = doctor?.fullName || 'Assigned Specialist';
        const meetingRoomId = `telemed-${Math.random().toString(36).substring(2, 8)}`;
        const newAppointmentData = {
            patientId: patient._id,
            doctorId,
            doctorName,
            patientName: patient.fullName,
            date,
            timeSlot,
            modality,
            chiefComplaint,
            urgency: urgency || 'routine',
            status: 'confirmed',
            meetingRoomId,
            vitalsBrief: vitalsBrief || { bp: '120/80', pulse: 72, spo2: 98, glucose: 100 },
        };
        if (db_1.isDbConnected) {
            const appointment = await models_1.Appointment.create(newAppointmentData);
            return res.status(201).json({
                success: true,
                message: 'Appointment scheduled successfully',
                data: appointment,
            });
        }
        else {
            const appointment = {
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                ...newAppointmentData,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            store_1.memoryStore.appointments.unshift(appointment);
            return res.status(201).json({
                success: true,
                message: 'Appointment scheduled successfully',
                data: appointment,
            });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 7. PUT /appointments/:id/cancel
router.put('/appointments/:id/cancel', async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { cancelReason } = req.body;
        if (db_1.isDbConnected) {
            const appointment = await models_1.Appointment.findByIdAndUpdate(appointmentId, { status: 'cancelled', cancelReason: cancelReason || 'Cancelled by patient' }, { new: true });
            if (!appointment) {
                return res.status(404).json({ success: false, error: 'Appointment not found' });
            }
            return res.json({ success: true, message: 'Appointment cancelled', data: appointment });
        }
        else {
            const appointment = store_1.memoryStore.appointments.find((a) => a._id.toString() === appointmentId.toString());
            if (!appointment) {
                return res.status(404).json({ success: false, error: 'Appointment not found' });
            }
            appointment.status = 'cancelled';
            appointment.cancelReason = cancelReason || 'Cancelled by patient';
            appointment.updatedAt = new Date();
            return res.json({ success: true, message: 'Appointment cancelled', data: appointment });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 8. GET /health-metrics
router.get('/health-metrics', async (req, res) => {
    try {
        const patient = await getPatientProfile(req.user.userId);
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient profile not found' });
        }
        const { metricType } = req.query;
        if (db_1.isDbConnected) {
            const filter = { patientId: patient._id };
            if (metricType)
                filter.metricType = metricType;
            const metrics = await models_1.HealthMetric.find(filter).sort({ recordedAt: -1 }).limit(100);
            return res.json({ success: true, data: metrics });
        }
        else {
            let metrics = store_1.memoryStore.healthMetrics.filter((m) => m.patientId.toString() === patient._id.toString());
            if (metricType) {
                metrics = metrics.filter((m) => m.metricType === metricType);
            }
            return res.json({ success: true, data: metrics });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 9. POST /health-metrics
router.post('/health-metrics', (0, validate_1.validateBody)(patientValidator_1.logMetricSchema), async (req, res) => {
    try {
        const patient = await getPatientProfile(req.user.userId);
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient profile not found' });
        }
        const { metricType, value, unit, details, measuredBy } = req.body;
        // Automatic status evaluation based on clinical thresholds
        let status = 'normal';
        if (metricType === 'blood_glucose') {
            const numVal = typeof value === 'number' ? value : parseFloat(value);
            if (numVal > 180)
                status = 'critical';
            else if (numVal > 130)
                status = 'elevated';
            else
                status = 'normal';
        }
        else if (metricType === 'blood_pressure' && details?.systolic) {
            if (details.systolic > 160)
                status = 'critical';
            else if (details.systolic > 130)
                status = 'elevated';
            else
                status = 'normal';
        }
        const metricData = {
            patientId: patient._id,
            metricType,
            value,
            unit,
            details,
            status,
            measuredBy: measuredBy || 'patient',
            recordedAt: new Date(),
        };
        if (db_1.isDbConnected) {
            const metric = await models_1.HealthMetric.create(metricData);
            return res.status(201).json({ success: true, message: 'Metric recorded', data: metric });
        }
        else {
            const metric = {
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                ...metricData,
                createdAt: new Date(),
            };
            store_1.memoryStore.healthMetrics.unshift(metric);
            return res.status(201).json({ success: true, message: 'Metric recorded', data: metric });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 10. GET /consultations
router.get('/consultations', async (req, res) => {
    try {
        const patient = await getPatientProfile(req.user.userId);
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient profile not found' });
        }
        if (db_1.isDbConnected) {
            const consultations = await models_1.Consultation.find({ patientId: patient._id })
                .populate('doctorId', 'fullName specialty hospitalAffiliation')
                .sort({ createdAt: -1 });
            return res.json({ success: true, data: consultations });
        }
        else {
            const consultations = store_1.memoryStore.consultations.filter((c) => c.patientId.toString() === patient._id.toString());
            return res.json({ success: true, data: consultations });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
