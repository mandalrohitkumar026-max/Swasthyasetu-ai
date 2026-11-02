"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const doctorValidator_1 = require("../validators/doctorValidator");
const db_1 = require("../config/db");
const models_1 = require("../models");
const store_1 = require("../services/store");
const router = (0, express_1.Router)();
// Middleware: all routes here require doctor or admin role
router.use(auth_1.authenticateToken);
router.use((0, auth_1.requireRole)(['doctor', 'admin']));
// Helper to resolve doctor profile from authenticated user
const getDoctorProfile = async (userId) => {
    if (db_1.isDbConnected) {
        return await models_1.Doctor.findOne({ userId });
    }
    return store_1.memoryStore.doctors.find((d) => d.userId.toString() === userId.toString());
};
// 1. GET /me - Doctor Profile
router.get('/me', async (req, res) => {
    try {
        const doctor = await getDoctorProfile(req.user.userId);
        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor profile not found' });
        }
        return res.json({ success: true, data: doctor });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 2. PUT /me - Update Doctor Profile
router.put('/me', (0, validate_1.validateBody)(doctorValidator_1.updateDoctorProfileSchema), async (req, res) => {
    try {
        const updates = req.body;
        if (db_1.isDbConnected) {
            const doctor = await models_1.Doctor.findOneAndUpdate({ userId: req.user.userId }, { $set: updates }, { new: true });
            return res.json({ success: true, message: 'Doctor profile updated', data: doctor });
        }
        else {
            const doctor = store_1.memoryStore.doctors.find((d) => d.userId.toString() === req.user.userId.toString());
            if (!doctor) {
                return res.status(404).json({ success: false, error: 'Doctor profile not found' });
            }
            Object.assign(doctor, updates, { updatedAt: new Date() });
            return res.json({ success: true, message: 'Doctor profile updated', data: doctor });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 3. GET /appointments - Doctor's OPD Queue
router.get('/appointments', async (req, res) => {
    try {
        const doctor = await getDoctorProfile(req.user.userId);
        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor profile not found' });
        }
        const { status, date } = req.query;
        if (db_1.isDbConnected) {
            const query = { doctorId: doctor._id };
            if (status)
                query.status = status;
            if (date)
                query.date = date;
            const appointments = await models_1.Appointment.find(query)
                .populate('patientId', 'fullName gender dateOfBirth bloodGroup abhaId address allergies')
                .sort({ date: 1, timeSlot: 1 });
            return res.json({ success: true, data: appointments });
        }
        else {
            let appointments = store_1.memoryStore.appointments.filter((a) => a.doctorId.toString() === doctor._id.toString());
            if (status)
                appointments = appointments.filter((a) => a.status === status);
            if (date)
                appointments = appointments.filter((a) => a.date === date);
            return res.json({ success: true, data: appointments });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 4. PUT /appointments/:id/status - Update Consultation Status
router.put('/appointments/:id/status', (0, validate_1.validateBody)(doctorValidator_1.updateAppointmentStatusSchema), async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { status, cancelReason } = req.body;
        if (db_1.isDbConnected) {
            const appointment = await models_1.Appointment.findByIdAndUpdate(appointmentId, { status, ...(cancelReason ? { cancelReason } : {}) }, { new: true });
            if (!appointment) {
                return res.status(404).json({ success: false, error: 'Appointment not found' });
            }
            return res.json({ success: true, message: `Appointment status updated to ${status}`, data: appointment });
        }
        else {
            const appointment = store_1.memoryStore.appointments.find((a) => a._id.toString() === appointmentId.toString());
            if (!appointment) {
                return res.status(404).json({ success: false, error: 'Appointment not found' });
            }
            appointment.status = status;
            if (cancelReason)
                appointment.cancelReason = cancelReason;
            appointment.updatedAt = new Date();
            return res.json({ success: true, message: `Appointment status updated to ${status}`, data: appointment });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 5. GET /patients/:patientId/records - Access Authorized Patient Records
router.get('/patients/:patientId/records', async (req, res) => {
    try {
        const doctor = await getDoctorProfile(req.user.userId);
        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor profile not found' });
        }
        const { patientId } = req.params;
        // Verify appointment relationship or authorization (DPDP Consent check)
        let hasAppointment = false;
        if (db_1.isDbConnected) {
            const appt = await models_1.Appointment.findOne({ doctorId: doctor._id, patientId });
            hasAppointment = !!appt;
        }
        else {
            hasAppointment = store_1.memoryStore.appointments.some((a) => a.doctorId.toString() === doctor._id.toString() && a.patientId.toString() === patientId.toString());
        }
        if (!hasAppointment && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Patient records access denied: DPDP Act requires an active appointment or patient consent token.',
            });
        }
        if (db_1.isDbConnected) {
            const patient = await models_1.Patient.findById(patientId);
            const records = await models_1.MedicalRecord.find({ patientId }).sort({ createdAt: -1 });
            return res.json({
                success: true,
                data: {
                    patient,
                    records,
                },
            });
        }
        else {
            const patient = store_1.memoryStore.patients.find((p) => p._id.toString() === patientId.toString());
            const records = store_1.memoryStore.medicalRecords.filter((r) => r.patientId.toString() === patientId.toString());
            return res.json({
                success: true,
                data: {
                    patient,
                    records,
                },
            });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 6. POST /consultations - Create Clinical Note & Digital E-Prescription
router.post('/consultations', (0, validate_1.validateBody)(doctorValidator_1.createConsultationSchema), async (req, res) => {
    try {
        const doctor = await getDoctorProfile(req.user.userId);
        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor profile not found' });
        }
        const { appointmentId, patientId, chiefComplaint, clinicalNotes, symptoms, diagnosis, prescription, vitals, followUpDate, callDurationSeconds, } = req.body;
        // Create cryptographic digital signature
        const signaturePayload = `${doctor.fullName}|${doctor.nmcRegistrationNumber}|${patientId}|${Date.now()}`;
        const signatureHash = 'sha256-' + crypto_1.default.createHash('sha256').update(signaturePayload).digest('hex').substring(0, 32);
        const digitalSignature = {
            signedBy: `${doctor.fullName} (${doctor.qualifications ? doctor.qualifications.join(', ') : 'MBBS'})`,
            nmcNumber: doctor.nmcRegistrationNumber,
            timestamp: new Date().toISOString(),
            signatureHash,
        };
        const consultationData = {
            appointmentId,
            patientId,
            doctorId: doctor._id,
            chiefComplaint,
            clinicalNotes,
            symptoms: symptoms || [],
            diagnosis,
            prescription,
            vitals,
            digitalSignature,
            followUpDate,
            status: 'concluded',
            callDurationSeconds: callDurationSeconds || 300,
        };
        let savedConsultation = null;
        if (db_1.isDbConnected) {
            savedConsultation = await models_1.Consultation.create(consultationData);
            // Mark appointment as completed
            await models_1.Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
            // Automatically add a MedicalRecord prescription entry for the patient
            await models_1.MedicalRecord.create({
                patientId,
                recordType: 'prescription',
                title: `E-Prescription - ${diagnosis.condition}`,
                description: `Prescribed ${prescription.length} generic formulation(s) by ${doctor.fullName}`,
                doctorName: doctor.fullName,
                hospitalOrFacility: doctor.hospitalAffiliation || 'SwasthyaSetu Telehealth Network',
                recordDate: new Date().toISOString().split('T')[0],
                isAbdmSynced: true,
                tags: ['Teleconsultation', 'PMBJP Generic', 'Digital Signature Verified'],
                fhirData: {
                    resourceType: 'Bundle',
                    type: 'document',
                    entry: [
                        {
                            resource: {
                                resourceType: 'MedicationRequest',
                                status: 'active',
                                intent: 'order',
                                medicationCodeableConcept: {
                                    text: prescription.map((p) => p.genericSalt).join(', '),
                                },
                            },
                        },
                    ],
                },
            });
        }
        else {
            savedConsultation = {
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                ...consultationData,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            store_1.memoryStore.consultations.unshift(savedConsultation);
            // Update appointment in memory
            const appt = store_1.memoryStore.appointments.find((a) => a._id.toString() === appointmentId.toString());
            if (appt) {
                appt.status = 'completed';
                appt.updatedAt = new Date();
            }
            // Add medical record in memory
            store_1.memoryStore.medicalRecords.unshift({
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                patientId,
                recordType: 'prescription',
                title: `E-Prescription - ${diagnosis.condition}`,
                description: `Prescribed ${prescription.length} generic formulation(s) by ${doctor.fullName}`,
                doctorName: doctor.fullName,
                hospitalOrFacility: doctor.hospitalAffiliation || 'SwasthyaSetu Telehealth Network',
                recordDate: new Date().toISOString().split('T')[0],
                isAbdmSynced: true,
                tags: ['Teleconsultation', 'PMBJP Generic', 'Digital Signature Verified'],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        return res.status(201).json({
            success: true,
            message: 'Consultation concluded and digitally signed e-prescription issued successfully',
            data: savedConsultation,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// 7. GET /consultations/:id
router.get('/consultations/:id', async (req, res) => {
    try {
        const consultationId = req.params.id;
        if (db_1.isDbConnected) {
            const consultation = await models_1.Consultation.findById(consultationId)
                .populate('patientId', 'fullName gender dateOfBirth bloodGroup abhaId')
                .populate('doctorId', 'fullName specialty nmcRegistrationNumber');
            if (!consultation) {
                return res.status(404).json({ success: false, error: 'Consultation not found' });
            }
            return res.json({ success: true, data: consultation });
        }
        else {
            const consultation = store_1.memoryStore.consultations.find((c) => c._id.toString() === consultationId.toString());
            if (!consultation) {
                return res.status(404).json({ success: false, error: 'Consultation not found' });
            }
            return res.json({ success: true, data: consultation });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
