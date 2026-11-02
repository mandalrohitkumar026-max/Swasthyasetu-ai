"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const mockData_1 = require("../data/mockData");
const db_1 = require("../config/db");
const models_1 = require("../models");
const store_1 = require("../services/store");
const resourceValidator_1 = require("../validators/resourceValidator");
const router = (0, express_1.Router)();
// In-memory active appointments and prescriptions list for hybrid resilience
let appointments = [...mockData_1.mockAppointments];
let prescriptions = [...mockData_1.mockPrescriptions];
// 1. Get appointments
router.get('/appointments', (req, res) => {
    const role = req.query.role;
    const status = req.query.status;
    let result = appointments;
    if (status) {
        result = result.filter(a => a.status === status);
    }
    return res.json(result);
});
// 2. Book appointment / Push to doctor queue
router.post('/appointments', (req, res) => {
    const { patientName, patientAge, patientGender, triagePriority, chiefComplaints, aiClinicalSummary, consultationMode = 'video', vitals, scheduledDate, scheduledTime } = req.body;
    const newAppointment = {
        id: `apt-${Date.now().toString().slice(-4)}`,
        patientId: "usr-pat-01",
        patientName: patientName || "Ramesh Kumar",
        patientAge: Number(patientAge) || 48,
        patientGender: patientGender || "Male",
        doctorId: "usr-doc-01",
        doctorName: "Dr. Arvind Rao, MD",
        scheduledTime: scheduledTime || "Right Now (Immediate Queue)",
        scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
        status: "waiting",
        consultationMode: consultationMode,
        triagePriority: triagePriority || 'routine',
        chiefComplaints: chiefComplaints || ["General health inquiry"],
        aiClinicalSummary: aiClinicalSummary || "Patient queued following AI triage.",
        webrtcRoomId: `swasthya-room-${Date.now()}`,
        vitals: vitals || {
            bp: "120/80 mmHg",
            pulse: 74,
            spo2: 99,
            temperature: "98.6 °F"
        }
    };
    appointments.unshift(newAppointment);
    return res.status(201).json(newAppointment);
});
// 3. Update appointment status (e.g., doctor accepts, ends)
router.patch('/appointments/:id', (req, res) => {
    const { id } = req.params;
    const { status, consultationMode } = req.body;
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
    }
    if (status)
        appointment.status = status;
    if (consultationMode)
        appointment.consultationMode = consultationMode;
    return res.json(appointment);
});
// 4. Doctor Availability Checking
router.get('/availability/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        const date = req.query.date || new Date().toISOString().split('T')[0];
        let doctor = null;
        if (db_1.isDbConnected && mongoose_1.default.isValidObjectId(doctorId)) {
            doctor = await models_1.Doctor.findById(doctorId).lean();
        }
        if (!doctor) {
            doctor = store_1.memoryStore.doctors.find(d => d._id?.toString() === doctorId || d.userId?.toString() === doctorId);
        }
        // Default template slots if not customized
        const standardSlots = [
            '09:00 AM - 09:30 AM',
            '09:30 AM - 10:00 AM',
            '10:30 AM - 11:00 AM',
            '11:30 AM - 12:00 PM',
            '02:00 PM - 02:30 PM',
            '02:30 PM - 03:00 PM',
            '04:00 PM - 04:30 PM',
            '04:30 PM - 05:00 PM'
        ];
        const baseSlots = doctor?.availableSlots?.length ? doctor.availableSlots : standardSlots;
        // Filter out already booked slots for this date
        const bookedSlotsForDate = appointments
            .filter(a => (a.doctorId === doctorId || doctorId === 'all') && a.scheduledDate === date && a.status !== 'cancelled')
            .map(a => a.scheduledTime);
        const availableSlots = baseSlots.filter((slot) => !bookedSlotsForDate.includes(slot));
        return res.json({
            doctorId,
            doctorName: doctor?.fullName || "Dr. Priya Sharma",
            specialty: doctor?.specialty || "Internal Medicine & Diabetology",
            hospitalAffiliation: doctor?.hospitalAffiliation || "District Civil Hospital & Ayushman Arogya Mandir",
            consultationFee: doctor?.consultationFee ?? 100, // Subsidized
            date,
            modesSupported: ['video', 'audio', 'kiosk_telemed'],
            totalSlots: baseSlots.length,
            availableSlotsCount: availableSlots.length,
            slots: availableSlots,
            isImmediateQueueActive: true,
            nextAvailableSlot: availableSlots[0] || 'Next Day 09:00 AM'
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to retrieve doctor availability', details: err.message });
    }
});
// 5. Patient Follow-up Records
router.post('/follow-ups', async (req, res) => {
    try {
        const parseResult = resourceValidator_1.scheduleFollowUpSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors,
            });
        }
        const { appointmentId, patientId, doctorId, scheduledDate, reason, clinicalGoals } = parseResult.data;
        let patientName = req.body.patientName || 'Ramesh Patel';
        let doctorName = req.body.doctorName || 'Dr. Priya Sharma';
        const newFollowUpData = {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            appointmentId,
            patientId,
            doctorId,
            patientName,
            doctorName,
            scheduledDate,
            reason,
            clinicalGoals: clinicalGoals || ['Review treatment compliance', 'Check vitals'],
            status: 'scheduled',
            recoveryNotes: req.body.recoveryNotes || 'Follow-up queued via teleconsultation portal.',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if (db_1.isDbConnected && mongoose_1.default.isValidObjectId(appointmentId) && mongoose_1.default.isValidObjectId(patientId)) {
            try {
                const saved = await models_1.FollowUp.create(newFollowUpData);
                return res.status(201).json(saved);
            }
            catch {
                // Fallback to memoryStore
            }
        }
        store_1.memoryStore.followUps.unshift(newFollowUpData);
        return res.status(201).json(newFollowUpData);
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to schedule follow-up', details: err.message });
    }
});
// 6. Get Follow-up records
router.get('/follow-ups', async (req, res) => {
    try {
        const { patientId, doctorId, status } = req.query;
        if (db_1.isDbConnected) {
            const query = {};
            if (patientId && mongoose_1.default.isValidObjectId(patientId))
                query.patientId = patientId;
            if (doctorId && mongoose_1.default.isValidObjectId(doctorId))
                query.doctorId = doctorId;
            if (status)
                query.status = status;
            const records = await models_1.FollowUp.find(query).sort({ scheduledDate: 1 }).lean();
            if (records.length > 0) {
                return res.json(records);
            }
        }
        let records = store_1.memoryStore.followUps || [];
        if (patientId) {
            records = records.filter(r => r.patientId?.toString() === patientId || patientId === 'usr-pat-01');
        }
        if (doctorId) {
            records = records.filter(r => r.doctorId?.toString() === doctorId || doctorId === 'usr-doc-01');
        }
        if (status) {
            records = records.filter(r => r.status === status);
        }
        return res.json(records);
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch follow-up records', details: err.message });
    }
});
// 7. Update Follow-up status
router.patch('/follow-ups/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, recoveryNotes } = req.body;
        if (db_1.isDbConnected && mongoose_1.default.isValidObjectId(id)) {
            const updated = await models_1.FollowUp.findByIdAndUpdate(id, { $set: { ...(status && { status }), ...(recoveryNotes && { recoveryNotes }), updatedAt: new Date() } }, { new: true });
            if (updated)
                return res.json(updated);
        }
        const item = store_1.memoryStore.followUps.find(f => f._id?.toString() === id || f.id === id);
        if (!item) {
            return res.status(404).json({ error: 'Follow-up record not found' });
        }
        if (status)
            item.status = status;
        if (recoveryNotes)
            item.recoveryNotes = recoveryNotes;
        item.updatedAt = new Date();
        return res.json(item);
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to update follow-up', details: err.message });
    }
});
// 8. Secure Telemedicine Consultation Room & Signaling Info
router.get('/rooms/:appointmentId', (req, res) => {
    const { appointmentId } = req.params;
    const apt = appointments.find(a => a.id === appointmentId);
    const roomId = apt ? apt.webrtcRoomId : `swasthya-room-${appointmentId}`;
    return res.json({
        appointmentId,
        roomId,
        serverUrl: "wss://signaling.swasthyasetu.gov.in/v1",
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ],
        mode: apt?.consultationMode || 'video',
        bandwidthProfile: {
            audioOnlyBitrateKbps: 24,
            lowBandwidthVideoKbps: 150,
            standardVideoKbps: 600,
            adaptiveDegradation: true
        },
        clientToken: `ss-token-${Buffer.from(roomId).toString('base64').slice(0, 16)}`
    });
});
// 9. Create and digitally sign an E-Prescription
router.post('/prescriptions', (req, res) => {
    const { appointmentId, patientId, diagnosis, clinicalNotes, items } = req.body;
    let totalBrandedCost = 0;
    let totalJanAushadhiCost = 0;
    const enrichedItems = (items || []).map((item) => {
        const med = mockData_1.mockMedicines.find(m => m.id === item.medicineId);
        const brandedPrice = med ? med.brandedPrice : 100;
        const janAushadhiPrice = med ? med.janAushadhiPrice : 25;
        totalBrandedCost += brandedPrice;
        totalJanAushadhiCost += item.isGenericSubstituted ? janAushadhiPrice : brandedPrice;
        return {
            medicineId: item.medicineId,
            brandName: item.brandName || (med ? med.brandName : "Generic Rx"),
            genericSalt: item.genericSalt || (med ? med.genericSalt : "Standard Formulation"),
            dosageInstruction: item.dosageInstruction || "1 tablet daily",
            durationDays: item.durationDays || 30,
            quantity: item.quantity || 30,
            price: item.isGenericSubstituted ? janAushadhiPrice : brandedPrice,
            isGenericSubstituted: item.isGenericSubstituted ?? true
        };
    });
    const totalSavings = totalBrandedCost - totalJanAushadhiCost;
    // Cryptographic simulation of doctor digital signature
    const signatureHash = `0xSHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-NMC-VERIFIED`;
    const newPrescription = {
        id: `rx-${Date.now().toString().slice(-4)}`,
        appointmentId: appointmentId || "apt-001",
        patientId: patientId || "usr-pat-01",
        patientName: "Ramesh Patel",
        doctorId: "usr-doc-01",
        doctorName: "Dr. Arvind Rao, MD",
        doctorRegNo: "MCI/UP-2012/048821",
        diagnosis: diagnosis || "Type 2 Diabetes Mellitus with Essential Stage-1 Hypertension",
        clinicalNotes: clinicalNotes || "Patient advised lifestyle modification and generic substitution.",
        prescribedAt: new Date().toISOString(),
        signatureHash,
        totalBrandedCost,
        totalJanAushadhiCost,
        totalSavings,
        items: enrichedItems,
        fhirBundleId: `urn:uuid:fhir-bundle-${Date.now()}`
    };
    prescriptions.unshift(newPrescription);
    // Mark appointment as completed
    const apt = appointments.find(a => a.id === appointmentId);
    if (apt) {
        apt.status = 'completed';
    }
    return res.status(201).json(newPrescription);
});
// 10. Get prescriptions
router.get('/prescriptions', (req, res) => {
    return res.json(prescriptions);
});
// ============================================================================
// DOCTOR DASHBOARD SUMMARY & WORKSPACE ENDPOINTS
// ============================================================================
let consultationNotesList = [
    {
        id: 'note-01',
        appointmentId: 'apt-001',
        patientId: 'usr-pat-01',
        patientName: 'Ramesh Patel',
        doctorName: 'Dr. Arvind Rao, MD',
        diagnosis: 'Type 2 Diabetes Mellitus with Stage-1 Hypertension',
        notes: 'Advised strict low glycemic diet, daily brisk walking for 30 minutes, and home capillary glucose monitoring. Generic Metformin + Glimepiride and Telmisartan prescribed with 79% cost savings.',
        createdAt: '2026-11-01 10:45:00',
        tags: ['NCD', 'Chronic Care', 'PMBJP Substituted']
    },
    {
        id: 'note-02',
        appointmentId: 'apt-002',
        patientId: 'usr-pat-02',
        patientName: 'Sunita Devi',
        doctorName: 'Dr. Priya Sharma',
        diagnosis: 'Third Trimester Antenatal Routine Evaluation',
        notes: 'Fundal height corresponds to gestational age (32 weeks). Fetal heart sounds normal (142 bpm). IFA supplementation compliance verified. Advised institutional delivery at District Civil Hospital.',
        createdAt: '2026-10-30 11:20:00',
        tags: ['Maternal Health', 'ANC']
    }
];
const managedPatientsList = [
    {
        id: 'usr-pat-01',
        name: 'Ramesh Patel',
        age: 48,
        gender: 'Male',
        abhaNumber: '14-8921-4321-7654',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        chronicConditions: ['Type 2 Diabetes Mellitus', 'Stage-1 Hypertension'],
        lastConsultation: '2026-11-01',
        nextFollowUp: '2026-11-15',
        complianceRate: '94%',
        allergies: ['Penicillin (Mild urticaria)'],
        vitalsLatest: { bp: '144/92 mmHg', glucose: '242 mg/dL', pulse: 84, spo2: '98%' },
        labReports: [
            { testName: 'HbA1c Glycated Hemoglobin', result: '8.4%', normalRange: '< 5.7%', date: '2026-10-24', status: 'High' },
            { testName: 'Fasting Plasma Glucose', result: '178 mg/dL', normalRange: '70-100 mg/dL', date: '2026-10-24', status: 'High' },
            { testName: 'Serum Creatinine', result: '1.0 mg/dL', normalRange: '0.7-1.3 mg/dL', date: '2026-10-24', status: 'Normal' },
            { testName: 'Lipid Profile (Total Cholesterol)', result: '210 mg/dL', normalRange: '< 200 mg/dL', date: '2026-10-24', status: 'Borderline' }
        ],
        pastPrescriptions: [
            { id: 'rx-9821', date: '2026-11-01', doctor: 'Dr. Arvind Rao, MD', drugs: ['Metformin 500mg + Glimepiride 2mg', 'Telmisartan 40mg', 'Pan-D Capsule'] },
            { id: 'rx-9104', date: '2026-08-12', doctor: 'Dr. Vikram Malhotra, MD', drugs: ['Amlodipine 5mg', 'Metformin 500mg'] }
        ]
    },
    {
        id: 'usr-pat-02',
        name: 'Sunita Devi',
        age: 26,
        gender: 'Female',
        abhaNumber: '91-3321-9981-4432',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        chronicConditions: ['Gestational Anemia (Mild)'],
        lastConsultation: '2026-10-30',
        nextFollowUp: '2026-11-14',
        complianceRate: '98%',
        allergies: ['No known drug allergies'],
        vitalsLatest: { bp: '118/76 mmHg', glucose: '94 mg/dL', pulse: 78, spo2: '99%' },
        labReports: [
            { testName: 'Hemoglobin (CBC)', result: '10.2 g/dL', normalRange: '12.0-15.5 g/dL', date: '2026-10-28', status: 'Low (Mild Anemia)' },
            { testName: 'Blood Group & Rh Typing', result: 'B Positive', normalRange: 'N/A', date: '2026-10-28', status: 'Normal' }
        ],
        pastPrescriptions: [
            { id: 'rx-8812', date: '2026-10-30', doctor: 'Dr. Priya Sharma', drugs: ['Iron Folic Acid (IFA) 100mg', 'Calcium Carbonate + Vit D3'] }
        ]
    },
    {
        id: 'usr-pat-03',
        name: 'Mohan Lal Verma',
        age: 62,
        gender: 'Male',
        abhaNumber: '22-7741-6512-8811',
        district: 'Hardoi',
        state: 'Uttar Pradesh',
        chronicConditions: ['Coronary Artery Disease', 'COPD'],
        lastConsultation: '2026-10-26',
        nextFollowUp: '2026-11-10',
        complianceRate: '88%',
        allergies: ['Sulfa drugs'],
        vitalsLatest: { bp: '136/84 mmHg', glucose: '128 mg/dL', pulse: 72, spo2: '95%' },
        labReports: [
            { testName: 'ECG 12-Lead', result: 'Normal sinus rhythm, old inferior ischemic changes', normalRange: 'Normal', date: '2026-10-26', status: 'Reviewed' }
        ],
        pastPrescriptions: [
            { id: 'rx-8420', date: '2026-10-26', doctor: 'Dr. Vikram Malhotra', drugs: ['Atorvastatin 20mg', 'Aspirin 75mg', 'Salbutamol Inhaler'] }
        ]
    }
];
// 11. GET /api/telemed/doctor/dashboard-summary
router.get('/doctor/dashboard-summary', (req, res) => {
    const waitingApts = appointments.filter(a => a.status === 'waiting');
    const completedApts = appointments.filter(a => a.status === 'completed');
    const scheduledApts = appointments.filter(a => a.status === 'scheduled');
    const appointmentRequests = [
        {
            id: 'req-01',
            patientName: 'Kailash Chand',
            patientAge: 54,
            patientGender: 'Male',
            district: 'Sitapur (Parsendi Block)',
            modality: 'kiosk',
            preferredTime: 'Today 03:30 PM',
            triagePriority: 'urgent',
            chiefComplaint: 'Sudden chest heaviness and blurred vision (BP: 168/104 at Gram Kiosk)',
            requestedAt: '12 mins ago'
        },
        {
            id: 'req-02',
            patientName: 'Radha Rani',
            patientAge: 32,
            patientGender: 'Female',
            district: 'Hardoi Rural',
            modality: 'audio',
            preferredTime: 'Today 04:00 PM',
            triagePriority: 'routine',
            chiefComplaint: 'Post-viral joint aches and follow-up on fever test results',
            requestedAt: '35 mins ago'
        }
    ];
    const doctorWorkloadStats = {
        consultationCaseMix: [
            { name: 'Diabetes & Metabolism', value: 42, color: '#0d9488' },
            { name: 'Cardiology & Hypertension', value: 28, color: '#0284c7' },
            { name: 'Respiratory & Infections', value: 18, color: '#f59e0b' },
            { name: 'General Medicine & Triage', value: 12, color: '#6366f1' },
        ],
        weeklyActivity: [
            { day: 'Mon', completed: 18, urgent: 4, waitTime: 4.8 },
            { day: 'Tue', completed: 22, urgent: 6, waitTime: 4.1 },
            { day: 'Wed', completed: 19, urgent: 3, waitTime: 3.9 },
            { day: 'Thu', completed: 25, urgent: 5, waitTime: 4.5 },
            { day: 'Fri', completed: 21, urgent: 4, waitTime: 4.0 },
            { day: 'Sat', completed: 16, urgent: 2, waitTime: 3.5 },
            { day: 'Sun', completed: 12, urgent: 2, waitTime: 3.2 },
        ],
        monthlyConsultations: 248,
        avgWaitTimeMinutes: 4.2,
        genericSavingsGeneratedInr: 54620,
    };
    return res.json({
        success: true,
        doctor: {
            name: 'Dr. Arvind Rao, MD',
            nmcNumber: 'MCI/UP-2012/048821',
            specialty: 'Internal Medicine & Diabetology',
            hospital: 'District Civil Hospital Sitapur & Ayushman Arogya Mandir'
        },
        overview: {
            waitingQueueCount: waitingApts.length,
            completedTodayCount: completedApts.length,
            scheduledCount: scheduledApts.length,
            pendingRequestsCount: appointmentRequests.length,
            avgWaitTime: '4.2 mins',
            genericSavingsEnabled: '₹18,450'
        },
        todayAppointments: appointments,
        patientManagement: managedPatientsList,
        consultationHistory: prescriptions,
        appointmentRequests,
        authorizedPatientRecords: managedPatientsList,
        consultationNotes: consultationNotesList,
        workloadStats: doctorWorkloadStats
    });
});
// 12. POST /api/telemed/consultation-notes - Save clinical notes
router.post('/consultation-notes', (req, res) => {
    const { appointmentId, patientId, patientName, diagnosis, notes, tags } = req.body;
    const newNote = {
        id: `note-${Date.now().toString().slice(-4)}`,
        appointmentId: appointmentId || 'apt-001',
        patientId: patientId || 'usr-pat-01',
        patientName: patientName || 'Ramesh Patel',
        doctorName: 'Dr. Arvind Rao, MD',
        diagnosis: diagnosis || 'General Clinical Review',
        notes: notes || 'Patient evaluated and advised clinical compliance.',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        tags: tags || ['OPD Review']
    };
    consultationNotesList.unshift(newNote);
    return res.status(201).json({ success: true, data: newNote });
});
// 13. PATCH /api/telemed/appointments/:id/accept-request - Accept appointment request
router.patch('/appointments/:id/accept-request', (req, res) => {
    const { id } = req.params;
    const { scheduledTime, consultationMode } = req.body;
    const newApt = {
        id: `apt-${Date.now().toString().slice(-4)}`,
        patientId: 'usr-pat-04',
        patientName: req.body.patientName || 'Kailash Chand',
        patientAge: req.body.patientAge || 54,
        patientGender: req.body.patientGender || 'Male',
        doctorId: 'usr-doc-01',
        doctorName: 'Dr. Arvind Rao, MD',
        scheduledTime: scheduledTime || 'Today 03:30 PM',
        status: 'scheduled',
        consultationMode: (consultationMode || 'kiosk'),
        triagePriority: 'urgent',
        chiefComplaints: [req.body.chiefComplaint || 'Consultation request accepted by physician'],
        aiClinicalSummary: 'Appointment approved and queued on doctor calendar.',
        webrtcRoomId: `swasthya-room-${Date.now()}`,
        vitals: { bp: '168/104 mmHg', pulse: 88, spo2: 97, temperature: '98.4 °F' }
    };
    appointments.unshift(newApt);
    return res.json({ success: true, message: 'Appointment request accepted', appointment: newApt });
});
// ============================================================================
// PATIENT DASHBOARD SUMMARY ENDPOINT
// ============================================================================
// 14. GET /api/telemed/patient/dashboard-summary
router.get('/patient/dashboard-summary', (req, res) => {
    const patientProfile = {
        id: 'usr-pat-01',
        name: 'Ramesh Patel',
        age: 48,
        gender: 'Male',
        abhaNumber: '14-8921-4321-7654',
        abhaAddress: 'ramesh.patel@abdm',
        district: 'Sitapur',
        state: 'Uttar Pradesh',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        bloodGroup: 'B Positive'
    };
    const healthOverview = {
        vitalsLatest: {
            bloodPressure: '144/92 mmHg',
            bloodPressureStatus: 'Elevated (Stage-1)',
            bloodPressureColor: 'text-amber-600',
            bloodGlucose: '242 mg/dL',
            bloodGlucoseStatus: 'High (Target < 130)',
            bloodGlucoseColor: 'text-rose-600',
            pulse: '84 bpm',
            pulseStatus: 'Normal (60-100)',
            pulseColor: 'text-teal-600',
            spo2: '98%',
            spo2Status: 'Optimal (95-100%)',
            spo2Color: 'text-emerald-600',
            lastSyncedAt: '18 minutes ago via Sitapur Gram Kiosk #01'
        },
        metricsChartSeries: {
            bloodGlucose7d: [
                { day: '25 Oct', value: 260, target: 130 },
                { day: '26 Oct', value: 248, target: 130 },
                { day: '27 Oct', value: 255, target: 130 },
                { day: '28 Oct', value: 240, target: 130 },
                { day: '29 Oct', value: 235, target: 130 },
                { day: '30 Oct', value: 245, target: 130 },
                { day: '01 Nov', value: 242, target: 130 },
            ],
            bloodPressure7d: [
                { day: '25 Oct', systolic: 148, diastolic: 96, targetSys: 120, targetDia: 80 },
                { day: '26 Oct', systolic: 144, diastolic: 92, targetSys: 120, targetDia: 80 },
                { day: '27 Oct', systolic: 146, diastolic: 94, targetSys: 120, targetDia: 80 },
                { day: '28 Oct', systolic: 142, diastolic: 90, targetSys: 120, targetDia: 80 },
                { day: '29 Oct', systolic: 140, diastolic: 88, targetSys: 120, targetDia: 80 },
                { day: '30 Oct', systolic: 142, diastolic: 90, targetSys: 120, targetDia: 80 },
                { day: '01 Nov', systolic: 144, diastolic: 92, targetSys: 120, targetDia: 80 },
            ]
        }
    };
    const upcomingAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'waiting');
    const medicalHistory = {
        chronicIllnesses: [
            { condition: 'Type 2 Diabetes Mellitus', diagnosedYear: '2021', status: 'Active (On Oral Hypoglycemics)' },
            { condition: 'Essential Stage-1 Hypertension', diagnosedYear: '2022', status: 'Active (On Antihypertensives)' }
        ],
        allergies: ['Penicillin (Moderate rash)'],
        pastProcedures: ['Inguinal Hernia Repair (2018 at Sitapur Civil Hospital)'],
        recentPrescriptions: prescriptions
    };
    const notifications = [
        {
            id: 'notif-01',
            title: 'Upcoming Clinical Follow-Up',
            message: 'Your teleconsultation follow-up with Dr. Arvind Rao is scheduled for Nov 15.',
            time: '1 hour ago',
            priority: 'high',
            type: 'appointment'
        },
        {
            id: 'notif-02',
            title: 'Jan Aushadhi Medicine Refill Due',
            message: 'Your monthly Metformin + Glimepiride refill is due in 3 days. Available at Sitapur Jan Aushadhi Kendra for ₹38.',
            time: '4 hours ago',
            priority: 'medium',
            type: 'pharmacy'
        },
        {
            id: 'notif-03',
            title: 'Vitals Sync Confirmed',
            message: 'Bluetooth glucometer sync recorded 242 mg/dL successfully at Sitapur Gram Kiosk #01.',
            time: 'Yesterday',
            priority: 'low',
            type: 'vitals'
        }
    ];
    const healthcareRecommendations = [
        {
            id: 'rec-01',
            category: 'Diet & Nutrition',
            title: 'Reduce Dietary Sodium & High Glycemic Staples',
            description: 'Replace polished white rice with coarse grains (bajra, barley) and restrict daily table salt to under 1 teaspoon (<5g) to assist blood pressure regulation.',
            urgency: 'Action Recommended'
        },
        {
            id: 'rec-02',
            category: 'Physical Activity',
            title: '30-Minute Morning Brisk Walking',
            description: 'Regular moderate aerobic walking stimulates muscle glucose uptake independently of insulin, improving insulin sensitivity.',
            urgency: 'Daily Routine'
        },
        {
            id: 'rec-03',
            category: 'Preventive Screening',
            title: 'Quarterly HbA1c & Diabetic Foot Examination',
            description: 'Your next HbA1c test is recommended before Nov 24. Free test available at Sitapur Civil Hospital Diagnostic Hub.',
            urgency: 'Upcoming Test'
        }
    ];
    return res.json({
        success: true,
        patientProfile,
        healthOverview,
        upcomingAppointments,
        medicalHistory,
        notifications,
        healthcareRecommendations
    });
});
exports.default = router;
