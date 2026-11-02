import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { validateBody } from '../middleware/validate';
import { patientRegisterSchema, doctorRegisterSchema, loginSchema } from '../validators/authValidator';
import { authenticateToken, signToken } from '../middleware/auth';
import { isDbConnected } from '../config/db';
import { User, Patient, Doctor } from '../models';
import { memoryStore } from '../services/store';

const router = Router();

// 1. Patient Registration
router.post('/register-patient', validateBody(patientRegisterSchema), async (req: Request, res: Response) => {
  try {
    const { email, phone, password, fullName, gender, dateOfBirth, bloodGroup, address, emergencyContact, abhaId } =
      req.body;

    // Check existing in DB or Memory
    if (isDbConnected) {
      const existing = await User.findOne({ $or: [{ email }, { phone }] });
      if (existing) {
        return res.status(409).json({ success: false, error: 'User with this email or phone number already exists' });
      }
    } else {
      const existing = memoryStore.users.find((u) => u.email === email || u.phone === phone);
      if (existing) {
        return res.status(409).json({ success: false, error: 'User with this email or phone number already exists' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser: any;
    let newPatient: any;

    if (isDbConnected) {
      newUser = await User.create({
        email,
        phone,
        passwordHash,
        role: 'patient',
        isVerified: true,
        status: 'active',
      });

      newPatient = await Patient.create({
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
    } else {
      const userId = new mongoose.Types.ObjectId().toString();
      const patientId = new mongoose.Types.ObjectId().toString();

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
      memoryStore.users.push(newUser);

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
      memoryStore.patients.push(newPatient);
    }

    const token = signToken({
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
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Error registering patient' });
  }
});

// 2. Doctor Registration
router.post('/register-doctor', validateBody(doctorRegisterSchema), async (req: Request, res: Response) => {
  try {
    const {
      email,
      phone,
      password,
      fullName,
      nmcRegistrationNumber,
      specialty,
      qualifications,
      experienceYears,
      languages,
      consultationFee,
      hospitalAffiliation,
    } = req.body;

    if (isDbConnected) {
      const existing = await User.findOne({ $or: [{ email }, { phone }] });
      if (existing) {
        return res.status(409).json({ success: false, error: 'User with this email or phone number already exists' });
      }
      const existingNmc = await Doctor.findOne({ nmcRegistrationNumber });
      if (existingNmc) {
        return res.status(409).json({ success: false, error: 'Doctor with this NMC Registration Number already exists' });
      }
    } else {
      const existing = memoryStore.users.find((u) => u.email === email || u.phone === phone);
      if (existing) {
        return res.status(409).json({ success: false, error: 'User with this email or phone number already exists' });
      }
      const existingNmc = memoryStore.doctors.find((d) => d.nmcRegistrationNumber === nmcRegistrationNumber);
      if (existingNmc) {
        return res.status(409).json({ success: false, error: 'Doctor with this NMC Registration Number already exists' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser: any;
    let newDoctor: any;

    if (isDbConnected) {
      newUser = await User.create({
        email,
        phone,
        passwordHash,
        role: 'doctor',
        isVerified: false, // Must be verified by Admin
        status: 'pending',
      });

      newDoctor = await Doctor.create({
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
    } else {
      const userId = new mongoose.Types.ObjectId().toString();
      const doctorId = new mongoose.Types.ObjectId().toString();

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
      memoryStore.users.push(newUser);

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
      memoryStore.doctors.push(newDoctor);
    }

    const token = signToken({
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
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Error registering doctor' });
  }
});

// 3. Login
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;

    let user: any = null;

    if (isDbConnected) {
      user = await User.findOne({
        $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
      }).select('+passwordHash');
    } else {
      user = memoryStore.users.find(
        (u) => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone === emailOrPhone
      );
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. User not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email/phone or password.' });
    }

    // Retrieve profile details according to role
    let profile: any = null;
    if (user.role === 'patient') {
      if (isDbConnected) {
        profile = await Patient.findOne({ userId: user._id });
      } else {
        profile = memoryStore.patients.find((p) => p.userId.toString() === user._id.toString());
      }
    } else if (user.role === 'doctor') {
      if (isDbConnected) {
        profile = await Doctor.findOne({ userId: user._id });
      } else {
        profile = memoryStore.doctors.find((d) => d.userId.toString() === user._id.toString());
      }
    }

    const token = signToken({
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
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Login error' });
  }
});

// 4. Logout
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'User logged out successfully. Client should discard token.',
  });
});

// 5. Get current user profile (GET /me)
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const auth = req.user!;

    let user: any = null;
    let profile: any = null;

    if (isDbConnected) {
      user = await User.findById(auth.userId);
      if (auth.role === 'patient') {
        profile = await Patient.findOne({ userId: auth.userId });
      } else if (auth.role === 'doctor') {
        profile = await Doctor.findOne({ userId: auth.userId });
      }
    } else {
      user = memoryStore.users.find((u) => u._id.toString() === auth.userId.toString());
      if (auth.role === 'patient') {
        profile = memoryStore.patients.find((p) => p.userId.toString() === auth.userId.toString());
      } else if (auth.role === 'doctor') {
        profile = memoryStore.doctors.find((d) => d.userId.toString() === auth.userId.toString());
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
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
