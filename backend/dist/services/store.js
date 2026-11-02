"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryStore = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
// In-Memory store for offline / fallback resilience
class MemoryStore {
    users = [];
    patients = [];
    doctors = [];
    appointments = [];
    medicalRecords = [];
    healthMetrics = [];
    healthcareCenters = [];
    consultations = [];
    notifications = [];
    feedback = [];
    followUps = [];
    constructor() {
        this.seedDefaultData();
    }
    seedDefaultData() {
        const salt = bcryptjs_1.default.genSaltSync(10);
        const passHash = bcryptjs_1.default.hashSync('Pass@123', salt);
        // 1. Patient User & Profile
        const patientUserId = new mongoose_1.default.Types.ObjectId().toString();
        const patientProfileId = new mongoose_1.default.Types.ObjectId().toString();
        this.users.push({
            _id: patientUserId,
            email: 'patient@swasthyasetu.org',
            phone: '9876543210',
            passwordHash: passHash,
            role: 'patient',
            isVerified: true,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        this.patients.push({
            _id: patientProfileId,
            userId: patientUserId,
            fullName: 'Ramesh Patel',
            abhaId: '14-8921-4321-7654',
            abhaAddress: 'ramesh.patel@abdm',
            gender: 'male',
            dateOfBirth: new Date('1981-05-14'),
            bloodGroup: 'B+',
            address: {
                villageOrCity: 'Maholi Village',
                district: 'Sitapur',
                state: 'Uttar Pradesh',
                pincode: '261141',
            },
            emergencyContact: {
                name: 'Sunita Patel',
                phone: '9876543211',
                relationship: 'Spouse',
            },
            allergies: ['Penicillin', 'Sulfa drugs'],
            chronicConditions: ['Type-2 Diabetes', 'Hypertension'],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // 2. Doctor User & Profile
        const doctorUserId = new mongoose_1.default.Types.ObjectId().toString();
        const doctorProfileId = new mongoose_1.default.Types.ObjectId().toString();
        this.users.push({
            _id: doctorUserId,
            email: 'doctor@swasthyasetu.org',
            phone: '9876543220',
            passwordHash: passHash,
            role: 'doctor',
            isVerified: true,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        this.doctors.push({
            _id: doctorProfileId,
            userId: doctorUserId,
            fullName: 'Dr. Priya Sharma',
            nmcRegistrationNumber: 'NMC-UP-2015-883921',
            specialty: 'General Medicine',
            qualifications: ['MBBS (AIIMS New Delhi)', 'MD (Internal Medicine)'],
            experienceYears: 12,
            languages: ['Hindi', 'English', 'Bhojpuri'],
            consultationFee: 0, // Free rural subsidy
            availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'],
            verificationStatus: 'verified',
            hospitalAffiliation: 'Sitapur District Hospital / SwasthyaSetu Nodal Hub',
            rating: 4.9,
            reviewCount: 342,
            bio: 'Committed to affordable rural healthcare delivery and Indic telemedicine.',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // 3. Second Doctor (Pediatrician)
        const doc2UserId = new mongoose_1.default.Types.ObjectId().toString();
        const doc2ProfileId = new mongoose_1.default.Types.ObjectId().toString();
        this.users.push({
            _id: doc2UserId,
            email: 'dr.anand@swasthyasetu.org',
            phone: '9876543221',
            passwordHash: passHash,
            role: 'doctor',
            isVerified: true,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        this.doctors.push({
            _id: doc2ProfileId,
            userId: doc2UserId,
            fullName: 'Dr. Rajesh Anand',
            nmcRegistrationNumber: 'NMC-DL-2012-441209',
            specialty: 'Pediatrics',
            qualifications: ['MBBS', 'DCH (Child Health)'],
            experienceYears: 14,
            languages: ['Hindi', 'English', 'Punjabi'],
            consultationFee: 0,
            availableSlots: ['11:00 AM', '01:00 PM', '03:30 PM'],
            verificationStatus: 'verified',
            hospitalAffiliation: 'Community Health Center Sitapur',
            rating: 4.8,
            reviewCount: 218,
            bio: 'Pediatric care and childhood nutrition specialist.',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // 4. Admin User
        const adminUserId = new mongoose_1.default.Types.ObjectId().toString();
        this.users.push({
            _id: adminUserId,
            email: 'admin@swasthyasetu.org',
            phone: '9876543230',
            passwordHash: passHash,
            role: 'admin',
            isVerified: true,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // 5. Seed Appointments
        this.appointments.push({
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            patientId: patientProfileId,
            doctorId: doctorProfileId,
            patientName: 'Ramesh Patel',
            doctorName: 'Dr. Priya Sharma',
            date: new Date().toISOString().split('T')[0],
            timeSlot: '10:30 AM',
            modality: 'hd_video',
            chiefComplaint: 'Follow-up for fasting blood sugar spike and mild headache',
            urgency: 'routine',
            status: 'confirmed',
            meetingRoomId: 'telemed-setu-4981',
            vitalsBrief: { bp: '135/88', pulse: 78, spo2: 98, glucose: 142 },
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // 6. Seed Comprehensive 5-Tier Healthcare Resource Directory with Published Tariff Comparisons
        this.healthcareCenters.push(
        // --- Tier 1: Clinics (PHC / UPHC / Ayushman Arogya Mandir) ---
        {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            name: 'Primary Health Centre (PHC) & Ayushman Arogya Mandir - Maholi',
            category: 'clinic',
            type: 'phc',
            address: 'Near Block Development Office, Maholi',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261141',
            contactNumber: '+91 5862 248101',
            operatingHours: '08:00 AM - 04:00 PM',
            coordinates: { latitude: 27.6712, longitude: 80.4721 },
            servicesOffered: ['General OPD', 'Maternal Antenatal Care (ANC)', 'NCD Diabetes & BP Screening', 'Immunization'],
            publishedPricing: [
                { serviceName: 'General Physician OPD Consultation', governmentRate: 0, privateMarketAverageRate: 350, isSubsidizedOrFree: true, notes: '100% Free under National Health Mission' },
                { serviceName: 'Antenatal Checkup & Iron-Folic Supplements', governmentRate: 0, privateMarketAverageRate: 500, isSubsidizedOrFree: true, notes: 'Free under Janani Suraksha Yojana' },
                { serviceName: 'Random Blood Sugar Screening', governmentRate: 0, privateMarketAverageRate: 100, isSubsidizedOrFree: true, notes: 'Free NCD point-of-care test' }
            ],
            accreditations: ['Ayushman Arogya Mandir Certified', 'National Health Mission'],
            schemesAccepted: ['Ayushman Bharat (PM-JAY)', 'Free Essential Drugs Scheme'],
            hasStockAvailable: true,
            kioskUptimePercentage: 99.4,
            emergencyCasualtyAvailable: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            name: 'Urban Primary Health Centre (UPHC) - Civil Lines, Sitapur',
            category: 'clinic',
            type: 'uphc',
            address: 'Near Old Bus Stand, Civil Lines, Sitapur',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261001',
            contactNumber: '+91 5862 250114',
            operatingHours: '08:00 AM - 02:00 PM',
            coordinates: { latitude: 27.5750, longitude: 80.6810 },
            servicesOffered: ['Urban Day OPD', 'Geriatric Chronic Care', 'Routine Pathology Collection', 'Free Pharmacy'],
            publishedPricing: [
                { serviceName: 'OPD Clinical Consultation', governmentRate: 0, privateMarketAverageRate: 400, isSubsidizedOrFree: true },
                { serviceName: 'Blood Pressure & ECG Checkup', governmentRate: 0, privateMarketAverageRate: 300, isSubsidizedOrFree: true }
            ],
            accreditations: ['Urban Health Mission (NUHM)'],
            schemesAccepted: ['Ayushman Bharat PM-JAY'],
            hasStockAvailable: true,
            kioskUptimePercentage: 99.1,
            emergencyCasualtyAvailable: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, 
        // --- Tier 2: Hospitals (District Civil Hospital & PM-JAY Empaneled) ---
        {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            name: 'Sitapur District Civil Hospital (300-Bed Govt Secondary Care)',
            category: 'hospital',
            type: 'district_hospital',
            address: 'Hospital Road, Civil Lines, Sitapur',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261001',
            contactNumber: '+91 5862 251900',
            operatingHours: '24x7 Emergency Casualty & Inpatient Services',
            coordinates: { latitude: 27.5706, longitude: 80.6776 },
            servicesOffered: ['24x7 Emergency Casualty', 'Inpatient Wards', 'General Surgery', 'ICU Care', 'Dialysis Unit', 'Blood Bank'],
            publishedPricing: [
                { serviceName: 'Specialist Doctor OPD Slip', governmentRate: 10, privateMarketAverageRate: 800, isSubsidizedOrFree: true, notes: '₹10 valid for 15 days' },
                { serviceName: 'General Inpatient Bed / Day', governmentRate: 0, privateMarketAverageRate: 2500, isSubsidizedOrFree: true, notes: 'Free lodging & diet' },
                { serviceName: 'Hemodialysis Session', governmentRate: 0, privateMarketAverageRate: 2200, isSubsidizedOrFree: true, notes: 'Free under Pradhan Mantri National Dialysis Programme' },
                { serviceName: 'Major Laparoscopic Appendectomy', governmentRate: 0, privateMarketAverageRate: 45000, isSubsidizedOrFree: true, notes: '100% Cashless under PM-JAY' }
            ],
            accreditations: ['NABH Accredited', 'National Quality Assurance Standards (NQAS)'],
            schemesAccepted: ['Ayushman Bharat PM-JAY', 'PM National Dialysis Programme', 'Rashtriya Swasthya Bima Yojana'],
            hasStockAvailable: true,
            kioskUptimePercentage: 99.9,
            emergencyCasualtyAvailable: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            name: 'Sitapur Apex PM-JAY Empaneled Multispecialty Hospital',
            category: 'hospital',
            type: 'pmjay_hospital',
            address: 'Bypass Road, Sitapur',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261001',
            contactNumber: '+91 5862 278890',
            operatingHours: '24x7 Emergency & Multi-Specialty OPD',
            coordinates: { latitude: 27.5620, longitude: 80.6650 },
            servicesOffered: ['Cardiology', 'Orthopedic Joint Replacement', 'Neuro-Trauma', 'Pediatric ICU'],
            publishedPricing: [
                { serviceName: 'Total Knee Replacement (Per Joint)', governmentRate: 0, privateMarketAverageRate: 185000, isSubsidizedOrFree: true, notes: '100% Cashless for Ayushman Golden Cardholders' },
                { serviceName: 'Coronary Angioplasty (Single Stent)', governmentRate: 0, privateMarketAverageRate: 140000, isSubsidizedOrFree: true, notes: 'Free under PM-JAY Package' }
            ],
            accreditations: ['PM-JAY Gold Empaneled', 'NABH Certified'],
            schemesAccepted: ['Ayushman Bharat (PM-JAY)', 'Central Government Health Scheme (CGHS)'],
            hasStockAvailable: true,
            kioskUptimePercentage: 99.7,
            emergencyCasualtyAvailable: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, 
        // --- Tier 3: Diagnostic Laboratories ---
        {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            name: 'National Free Diagnostic Service Hub - Sitapur Civil Hospital',
            category: 'diagnostic_lab',
            type: 'diagnostic_lab',
            address: 'Pathology Block, District Hospital, Sitapur',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261001',
            contactNumber: '+91 5862 251912',
            operatingHours: '08:00 AM - 05:00 PM (Emergency 24x7)',
            coordinates: { latitude: 27.5708, longitude: 80.6780 },
            servicesOffered: ['Complete Hemogram (CBC)', 'Lipid Profile', 'Liver Function Test (LFT)', 'HbA1c', 'Renal Function Test (KFT)', 'Sputum GeneXpert'],
            publishedPricing: [
                { serviceName: 'Complete Blood Count (CBC / Hemogram)', governmentRate: 0, privateMarketAverageRate: 350, isSubsidizedOrFree: true, notes: 'Free under National Free Diagnostics Initiative' },
                { serviceName: 'Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)', governmentRate: 0, privateMarketAverageRate: 750, isSubsidizedOrFree: true },
                { serviceName: 'HbA1c 3-Month Diabetes Assay', governmentRate: 0, privateMarketAverageRate: 600, isSubsidizedOrFree: true },
                { serviceName: 'Kidney Function Test (KFT / Creatinine)', governmentRate: 0, privateMarketAverageRate: 550, isSubsidizedOrFree: true }
            ],
            accreditations: ['NABL Accredited', 'ICMR Quality Control'],
            schemesAccepted: ['National Free Diagnostics Initiative', 'PM-JAY'],
            hasStockAvailable: true,
            kioskUptimePercentage: 99.8,
            emergencyCasualtyAvailable: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, 
        // --- Tier 4: Pharmacies (PMBJP Jan Aushadhi & AMRIT) ---
        {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            name: 'Pradhan Mantri Jan Aushadhi Kendra #1084',
            category: 'pharmacy',
            type: 'jan_aushadhi',
            address: 'Opposite Community Health Centre, Main Bazaar, Maholi',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261141',
            contactNumber: '+91 5862 248102',
            operatingHours: '08:30 AM - 08:30 PM',
            coordinates: { latitude: 27.6712, longitude: 80.4721 },
            servicesOffered: ['1800+ Generic Medicines', 'Prescription Dispensing', 'Insulin Supplies', 'Surgical Gloves & Syringes'],
            publishedPricing: [
                { serviceName: 'Metformin 500mg (Strip of 10 tablets)', governmentRate: 4.5, privateMarketAverageRate: 32, isSubsidizedOrFree: true, notes: '86% cost reduction' },
                { serviceName: 'Atorvastatin 10mg (Strip of 10 tablets)', governmentRate: 9.2, privateMarketAverageRate: 68, isSubsidizedOrFree: true, notes: '86% cost reduction' },
                { serviceName: 'Amoxicillin-Clavulanic 625mg (6 tablets)', governmentRate: 45, privateMarketAverageRate: 165, isSubsidizedOrFree: true, notes: '73% cost reduction' }
            ],
            accreditations: ['BPPI Certified', 'NABL Batch Verified'],
            schemesAccepted: ['Pradhan Mantri Bhartiya Janaushadhi Pariyojana'],
            hasStockAvailable: true,
            kioskUptimePercentage: 99.8,
            emergencyCasualtyAvailable: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            name: 'AMRIT Pharmacy & Affordable Implants Centre',
            category: 'pharmacy',
            type: 'jan_aushadhi',
            address: 'Ground Floor, District Hospital Campus, Sitapur',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261001',
            contactNumber: '+91 5862 251950',
            operatingHours: '24x7 Dispensing',
            coordinates: { latitude: 27.5710, longitude: 80.6772 },
            servicesOffered: ['Cancer Chemotherapy Drugs', 'Cardiovascular Stents', 'Orthopedic Implants', 'Cardiac Pacemakers'],
            publishedPricing: [
                { serviceName: 'Drug Eluting Coronary Stent (NPPA Capped)', governmentRate: 34128, privateMarketAverageRate: 110000, isSubsidizedOrFree: true, notes: 'Govt price-ceiling mandate' },
                { serviceName: 'Trastuzumab 440mg Oncology Injection', governmentRate: 18500, privateMarketAverageRate: 54000, isSubsidizedOrFree: true, notes: '65% AMRIT subsidy' }
            ],
            accreditations: ['Ministry of Health & Family Welfare (MoHFW)'],
            schemesAccepted: ['AMRIT Scheme', 'PM-JAY'],
            hasStockAvailable: true,
            kioskUptimePercentage: 99.9,
            emergencyCasualtyAvailable: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, 
        // --- Tier 5: Government Healthcare Resources & Emergency Services ---
        {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            name: 'National 108 Emergency Medical Ambulance Dispatch Hub',
            category: 'government_resource',
            type: 'government_hub',
            address: 'Integrated Control & Command Centre, Sitapur',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261001',
            contactNumber: '108 (Toll Free 24x7)',
            operatingHours: '24x7 365 Days Uninterrupted Emergency Response',
            coordinates: { latitude: 27.5700, longitude: 80.6750 },
            servicesOffered: ['Advanced Life Support (ALS) Ambulance', 'Basic Life Support (BLS) Ambulance', 'Trained EMT Resuscitation', 'GPS Tracked Dispatch'],
            publishedPricing: [
                { serviceName: 'Emergency Accident & Cardiac Patient Transport', governmentRate: 0, privateMarketAverageRate: 3500, isSubsidizedOrFree: true, notes: '100% Free Public Emergency Service by Govt of India' }
            ],
            accreditations: ['Government of India Emergency Medical Service'],
            schemesAccepted: ['National Ambulance Service (NAS)'],
            hasStockAvailable: true,
            kioskUptimePercentage: 100.0,
            emergencyCasualtyAvailable: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            name: 'Tele-MANAS National Tele-Mental Health Programme (Nodal Cell)',
            category: 'government_resource',
            type: 'government_hub',
            address: 'NIMHANS Nodal Tele-Counseling Centre (Toll Free 14416 / 1800-891-4416)',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261001',
            contactNumber: '14416 (Toll Free 24x7)',
            operatingHours: '24x7 Multi-lingual Psychological Counseling',
            coordinates: { latitude: 27.5720, longitude: 80.6780 },
            servicesOffered: ['Confidential Mental Health Counseling', 'Anxiety & Depression Triage', 'Suicide Prevention Crisis Helpline', 'Psychiatric Referral'],
            publishedPricing: [
                { serviceName: 'Psychological Assessment & Crisis Tele-Counseling', governmentRate: 0, privateMarketAverageRate: 1500, isSubsidizedOrFree: true, notes: '100% Free Service by Ministry of Health & Family Welfare' }
            ],
            accreditations: ['NIMHANS Technical Nodal Hub', 'Ministry of Health & Family Welfare'],
            schemesAccepted: ['National Mental Health Programme'],
            hasStockAvailable: true,
            kioskUptimePercentage: 99.9,
            emergencyCasualtyAvailable: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            name: 'SwasthyaSetu Gram Panchayat Kiosk #12 (Parsendi)',
            category: 'clinic',
            type: 'telemedicine_kiosk',
            address: 'Gram Sachivalaya, Parsendi Block',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261142',
            contactNumber: '+91 5862 249001',
            operatingHours: '08:00 AM - 06:00 PM',
            coordinates: { latitude: 27.5312, longitude: 80.6122 },
            servicesOffered: ['16 kbps 2G Teleconsultation', 'IoT Vitals Screening', 'ASHA Assisted OPD', 'E-Prescription Printout'],
            publishedPricing: [
                { serviceName: 'Teleconsultation with Specialist Physician', governmentRate: 0, privateMarketAverageRate: 600, isSubsidizedOrFree: true, notes: 'Rural community telemedicine subsidy' },
                { serviceName: 'Automated BP, Pulse, SpO2 & Glucose Screening', governmentRate: 0, privateMarketAverageRate: 150, isSubsidizedOrFree: true }
            ],
            accreditations: ['Gram Panchayat Digital Health Mission', 'SwasthyaSetu Network'],
            schemesAccepted: ['Rural Telehealth Grant', 'ABDM Integrated'],
            hasStockAvailable: true,
            kioskUptimePercentage: 99.2,
            emergencyCasualtyAvailable: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // 7. Seed Health Metrics
        this.healthMetrics.push({
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            patientId: patientProfileId,
            metricType: 'blood_glucose',
            value: 138,
            unit: 'mg/dL',
            details: { fastingState: 'Fasting (10h)', note: 'Mild morning spike' },
            status: 'elevated',
            recordedAt: new Date(Date.now() - 3600000 * 4),
            measuredBy: 'patient',
            createdAt: new Date(),
        }, {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            patientId: patientProfileId,
            metricType: 'blood_pressure',
            value: '135/88',
            unit: 'mmHg',
            details: { systolic: 135, diastolic: 88 },
            status: 'elevated',
            recordedAt: new Date(Date.now() - 3600000 * 24),
            measuredBy: 'kiosk',
            createdAt: new Date(),
        });
        // 8. Seed Medical Records (FHIR R4 DiagnosticReport / Prescription)
        this.medicalRecords.push({
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            patientId: patientProfileId,
            recordType: 'prescription',
            title: 'Digital E-Prescription - Diabetes & Hypertension',
            description: 'Prescribed Metformin 500mg and Amlodipine 5mg generic formulations',
            doctorName: 'Dr. Priya Sharma',
            hospitalOrFacility: 'Sitapur District Hospital / SwasthyaSetu Nodal Hub',
            recordDate: new Date().toISOString().split('T')[0],
            fhirData: {
                resourceType: 'MedicationRequest',
                id: 'mr-772184',
                status: 'active',
                intent: 'order',
                subject: { reference: `Patient/${patientProfileId}`, display: 'Ramesh Patel' },
                medicationCodeableConcept: {
                    coding: [{ system: 'http://snomed.info/sct', code: '318444007', display: 'Metformin Hydrochloride 500mg' }],
                },
            },
            isAbdmSynced: true,
            tags: ['Endocrinology', 'PMBJP Generic', 'ABDM Verified'],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // 9. Seed Consultations
        this.consultations.push({
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            appointmentId: this.appointments[0]._id,
            patientId: patientProfileId,
            doctorId: doctorProfileId,
            vitals: { bp: '135/88', pulse: 78, temp: 98.4, spo2: 98, glucose: 142 },
            chiefComplaint: 'Follow-up for fasting blood sugar spike and mild headache',
            clinicalNotes: 'Patient advised low glycemic diet, daily morning walks, and adherence to PMBJP generic Metformin.',
            symptoms: ['Mild bilateral headache', 'Occasional dry mouth'],
            diagnosis: {
                icd10Code: 'E11.9',
                condition: 'Type 2 Diabetes Mellitus without complications',
            },
            prescription: [
                {
                    medicineName: 'Jan Aushadhi Metformin 500mg',
                    genericSalt: 'Metformin Hydrochloride 500mg',
                    dosage: '1 tablet',
                    frequency: 'Twice daily after meals',
                    duration: '30 days',
                    instructions: 'Take with warm water after breakfast and dinner',
                    genericSavingsPercentage: 84,
                },
            ],
            digitalSignature: {
                signedBy: 'Dr. Priya Sharma (MD)',
                nmcNumber: 'NMC-UP-2015-883921',
                timestamp: new Date().toISOString(),
                signatureHash: 'sha256-89fa281a94bc7210e58832a4',
            },
            followUpDate: '2026-11-20',
            status: 'concluded',
            callDurationSeconds: 485,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // 10. Seed Notifications
        this.notifications.push({
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            userId: patientUserId,
            title: 'Upcoming Teleconsultation Today',
            message: 'Your teleconsultation with Dr. Priya Sharma is scheduled for today at 10:30 AM.',
            type: 'appointment',
            priority: 'high',
            isRead: false,
            actionUrl: '/telemedicine',
            createdAt: new Date(),
        });
        // 11. Seed Feedback
        this.feedback.push({
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            userId: patientUserId,
            userRole: 'patient',
            category: 'teleconsultation',
            rating: 5,
            comment: 'Consultation over 2G connection worked without any video stuttering. Dr. Priya was very helpful.',
            targetId: doctorProfileId,
            createdAt: new Date(),
        });
        // 12. Seed Patient Follow-Up Record
        this.followUps.push({
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            appointmentId: this.appointments[0]._id,
            patientId: patientProfileId,
            doctorId: doctorProfileId,
            patientName: 'Ramesh Patel',
            doctorName: 'Dr. Priya Sharma',
            scheduledDate: '2026-11-15',
            reason: 'Post-Metformin fasting blood glucose review & blood pressure check',
            clinicalGoals: ['Target fasting blood glucose <130 mg/dL', 'Blood pressure stabilization <130/80'],
            status: 'scheduled',
            recoveryNotes: 'Patient advised to log daily morning glucose in Health Monitoring portal',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}
exports.memoryStore = new MemoryStore();
