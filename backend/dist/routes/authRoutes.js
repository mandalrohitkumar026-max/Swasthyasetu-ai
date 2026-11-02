"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const validate_1 = require("../middleware/validate");
const authValidator_1 = require("../validators/authValidator");
const auth_1 = require("../middleware/auth");
const db_1 = require("../config/db");
const models_1 = require("../models");
const store_1 = require("../services/store");
const router = (0, express_1.Router)();
// 1. Patient Registration
router.post('/register-patient', (0, validate_1.validateBody)(authValidator_1.patientRegisterSchema), async (req, res) => {
    try {
        const { email, phone, password, fullName, gender, dateOfBirth, bloodGroup, address, emergencyContact, abhaId } = req.body;
        // Check existing in DB or Memory
        if (db_1.isDbConnected) {
            const existing = await models_1.User.findOne({ $or: [{ email }, { phone }] });
            if (existing) {
                return res.status(409).json({ success: false, error: 'User with this email or phone number already exists' });
            }
        }
        else {
            const existing = store_1.memoryStore.users.find((u) => u.email === email || u.phone === phone);
            if (existing) {
                return res.status(409).json({ success: false, error: 'User with this email or phone number already exists' });
            }
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        let newUser;
        let newPatient;
        if (db_1.isDbConnected) {
            newUser = await models_1.User.create({
                email,
                phone,
                passwordHash,
                role: 'patient',
                isVerified: true,
                status: 'active',
            });
            newPatient = await models_1.Patient.create({
                userId: newUser._id,
                fullName,
                gender,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                bloodGroup: bloodGroup || 'Unknown',
                address: address || {},
                emergencyContact: emergencyContact || {},
                abhaId: abhaId || `14-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
                abhaAddress: `${fullName.toLowerCase().replace(/\s+/g, '.')}${Math.floor(10 + Math.random() * 90)}@abdm`,
            });
        }
        else {
            const userId = new mongoose_1.default.Types.ObjectId().toString();
            const patientId = new mongoose_1.default.Types.ObjectId().toString();
            newUser = {
                _id: userId,
                email,
                phone,
                passwordHash,
                role: 'patient',
                isVerified: true,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            store_1.memoryStore.users.push(newUser);
            newPatient = {
                _id: patientId,
                userId,
                fullName,
                gender,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                bloodGroup: bloodGroup || 'Unknown',
                address: address || {},
                emergencyContact: emergencyContact || {},
                abhaId: abhaId || `14-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
                abhaAddress: `${fullName.toLowerCase().replace(/\s+/g, '.')}${Math.floor(10 + Math.random() * 90)}@abdm`,
                allergies: [],
                chronicConditions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            store_1.memoryStore.patients.push(newPatient);
        }
        const token = (0, auth_1.signToken)({
            userId: newUser._id.toString(),
            email: newUser.email,
            role: 'patient',
            profileId: newPatient._id.toString(),
        });
        return res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            data: {
                token,
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role,
                },
                profile: newPatient,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message || 'Error registering patient' });
    }
});
// 2. Doctor Registration
router.post('/register-doctor', (0, validate_1.validateBody)(authValidator_1.doctorRegisterSchema), async (req, res) => {
    try {
        const { email, phone, password, fullName, nmcRegistrationNumber, specialty, qualifications, experienceYears, languages, consultationFee, hospitalAffiliation, } = req.body;
        if (db_1.isDbConnected) {
            const existing = await models_1.User.findOne({ $or: [{ email }, { phone }] });
            if (existing) {
                return res.status(409).json({ success: false, error: 'User with this email or phone number already exists' });
            }
            const existingNmc = await models_1.Doctor.findOne({ nmcRegistrationNumber });
            if (existingNmc) {
                return res.status(409).json({ success: false, error: 'Doctor with this NMC Registration Number already exists' });
            }
        }
        else {
            const existing = store_1.memoryStore.users.find((u) => u.email === email || u.phone === phone);
            if (existing) {
                return res.status(409).json({ success: false, error: 'User with this email or phone number already exists' });
            }
            const existingNmc = store_1.memoryStore.doctors.find((d) => d.nmcRegistrationNumber === nmcRegistrationNumber);
            if (existingNmc) {
                return res.status(409).json({ success: false, error: 'Doctor with this NMC Registration Number already exists' });
            }
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        let newUser;
        let newDoctor;
        if (db_1.isDbConnected) {
            newUser = await models_1.User.create({
                email,
                phone,
                passwordHash,
                role: 'doctor',
                isVerified: false, // Must be verified by Admin
                status: 'pending',
            });
            newDoctor = await models_1.Doctor.create({
                userId: newUser._id,
                fullName,
                nmcRegistrationNumber,
                specialty,
                qualifications: qualifications || ['MBBS'],
                experienceYears: experienceYears || 1,
                languages: languages || ['Hindi', 'English'],
                consultationFee: consultationFee || 0,
                availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
                verificationStatus: 'pending',
                hospitalAffiliation: hospitalAffiliation || 'SwasthyaSetu Rural Telehealth Network',
            });
        }
        else {
            const userId = new mongoose_1.default.Types.ObjectId().toString();
            const doctorId = new mongoose_1.default.Types.ObjectId().toString();
            newUser = {
                _id: userId,
                email,
                phone,
                passwordHash,
                role: 'doctor',
                isVerified: false,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            store_1.memoryStore.users.push(newUser);
            newDoctor = {
                _id: doctorId,
                userId,
                fullName,
                nmcRegistrationNumber,
                specialty,
                qualifications: qualifications || ['MBBS'],
                experienceYears: experienceYears || 1,
                languages: languages || ['Hindi', 'English'],
                consultationFee: consultationFee || 0,
                availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
                verificationStatus: 'pending',
                hospitalAffiliation: hospitalAffiliation || 'SwasthyaSetu Rural Telehealth Network',
                rating: 4.8,
                reviewCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            store_1.memoryStore.doctors.push(newDoctor);
        }
        const token = (0, auth_1.signToken)({
            userId: newUser._id.toString(),
            email: newUser.email,
            role: 'doctor',
            profileId: newDoctor._id.toString(),
        });
        return res.status(201).json({
            success: true,
            message: 'Doctor registered successfully. Account pending NMC credentials verification.',
            data: {
                token,
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role,
                },
                profile: newDoctor,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message || 'Error registering doctor' });
    }
});
// 3. Login
router.post('/login', (0, validate_1.validateBody)(authValidator_1.loginSchema), async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;
        let user = null;
        if (db_1.isDbConnected) {
            user = await models_1.User.findOne({
                $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
            }).select('+passwordHash');
        }
        else {
            user = store_1.memoryStore.users.find((u) => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone === emailOrPhone);
        }
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials. User not found.' });
        }
        if (user.status === 'suspended') {
            return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact administrator.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email/phone or password.' });
        }
        // Retrieve profile details according to role
        let profile = null;
        if (user.role === 'patient') {
            if (db_1.isDbConnected) {
                profile = await models_1.Patient.findOne({ userId: user._id });
            }
            else {
                profile = store_1.memoryStore.patients.find((p) => p.userId.toString() === user._id.toString());
            }
        }
        else if (user.role === 'doctor') {
            if (db_1.isDbConnected) {
                profile = await models_1.Doctor.findOne({ userId: user._id });
            }
            else {
                profile = store_1.memoryStore.doctors.find((d) => d.userId.toString() === user._id.toString());
            }
        }
        const token = (0, auth_1.signToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            profileId: profile?._id ? profile._id.toString() : undefined,
        });
        return res.json({
            success: true,
            message: 'Authentication successful',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                    status: user.status,
                },
                profile,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message || 'Login error' });
    }
});
// 4. Logout
router.post('/logout', (_req, res) => {
    return res.json({
        success: true,
        message: 'User logged out successfully. Client should discard token.',
    });
});
// 5. Get current user profile (GET /me)
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const auth = req.user;
        let user = null;
        let profile = null;
        if (db_1.isDbConnected) {
            user = await models_1.User.findById(auth.userId);
            if (auth.role === 'patient') {
                profile = await models_1.Patient.findOne({ userId: auth.userId });
            }
            else if (auth.role === 'doctor') {
                profile = await models_1.Doctor.findOne({ userId: auth.userId });
            }
        }
        else {
            user = store_1.memoryStore.users.find((u) => u._id.toString() === auth.userId.toString());
            if (auth.role === 'patient') {
                profile = store_1.memoryStore.patients.find((p) => p.userId.toString() === auth.userId.toString());
            }
            else if (auth.role === 'doctor') {
                profile = store_1.memoryStore.doctors.find((d) => d.userId.toString() === auth.userId.toString());
            }
        }
        if (!user) {
            return res.status(404).json({ success: false, error: 'User account not found' });
        }
        return res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                    status: user.status,
                },
                profile,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
