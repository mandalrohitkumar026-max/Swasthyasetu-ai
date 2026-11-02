import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  updateProfileSchema,
  bookAppointmentSchema,
  logMetricSchema,
  createMedicalRecordSchema,
} from '../validators/patientValidator';
import { isDbConnected } from '../config/db';
import { Patient, Appointment, MedicalRecord, HealthMetric, Consultation, Doctor } from '../models';
import { memoryStore } from '../services/store';

const router = Router();

// Middleware: all routes here require a logged-in patient
router.use(authenticateToken);
router.use(requireRole(['patient', 'admin']));

// Helper to resolve patient profile from authenticated user
const getPatientProfile = async (userId: string) => {
  if (isDbConnected) {
    return await Patient.findOne({ userId });
  }
  return memoryStore.patients.find((p) => p.userId.toString() === userId.toString());
};

// 1. GET /me - Patient Profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const patient = await getPatientProfile(req.user!.userId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }
    return res.json({ success: true, data: patient });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. PUT /me - Update Patient Profile
router.put('/me', validateBody(updateProfileSchema), async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    if (isDbConnected) {
      const patient = await Patient.findOneAndUpdate(
        { userId: req.user!.userId },
        { $set: updates },
        { new: true }
      );
      return res.json({ success: true, message: 'Profile updated successfully', data: patient });
    } else {
      const patient = memoryStore.patients.find((p) => p.userId.toString() === req.user!.userId.toString());
      if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient profile not found' });
      }
      Object.assign(patient, updates, { updatedAt: new Date() });
      return res.json({ success: true, message: 'Profile updated successfully', data: patient });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /medical-records
router.get('/medical-records', async (req: Request, res: Response) => {
  try {
    const patient = await getPatientProfile(req.user!.userId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    if (isDbConnected) {
      const records = await MedicalRecord.find({ patientId: patient._id }).sort({ createdAt: -1 });
      return res.json({ success: true, data: records });
    } else {
      const records = memoryStore.medicalRecords.filter((r) => r.patientId.toString() === patient._id.toString());
      return res.json({ success: true, data: records });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. POST /medical-records
router.post('/medical-records', validateBody(createMedicalRecordSchema), async (req: Request, res: Response) => {
  try {
    const patient = await getPatientProfile(req.user!.userId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const recordData = {
      ...req.body,
      patientId: patient._id,
      isAbdmSynced: false,
    };

    if (isDbConnected) {
      const record = await MedicalRecord.create(recordData);
      return res.status(201).json({ success: true, message: 'Record added successfully', data: record });
    } else {
      const record = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...recordData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.medicalRecords.unshift(record);
      return res.status(201).json({ success: true, message: 'Record added successfully', data: record });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET /appointments
router.get('/appointments', async (req: Request, res: Response) => {
  try {
    const patient = await getPatientProfile(req.user!.userId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    if (isDbConnected) {
      const appointments = await Appointment.find({ patientId: patient._id })
        .populate('doctorId', 'fullName specialty hospitalAffiliation')
        .sort({ date: -1, createdAt: -1 });
      return res.json({ success: true, data: appointments });
    } else {
      const appointments = memoryStore.appointments.filter(
        (a) => a.patientId.toString() === patient._id.toString()
      );
      return res.json({ success: true, data: appointments });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. POST /appointments - Book Appointment
router.post('/appointments', validateBody(bookAppointmentSchema), async (req: Request, res: Response) => {
  try {
    const patient = await getPatientProfile(req.user!.userId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const { doctorId, date, timeSlot, modality, chiefComplaint, urgency, vitalsBrief } = req.body;

    // Verify doctor exists
    let doctor: any = null;
    if (isDbConnected) {
      doctor = await Doctor.findById(doctorId);
    } else {
      doctor = memoryStore.doctors.find((d) => d._id.toString() === doctorId.toString());
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

    if (isDbConnected) {
      const appointment = await Appointment.create(newAppointmentData);
      return res.status(201).json({
        success: true,
        message: 'Appointment scheduled successfully',
        data: appointment,
      });
    } else {
      const appointment = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...newAppointmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.appointments.unshift(appointment);
      return res.status(201).json({
        success: true,
        message: 'Appointment scheduled successfully',
        data: appointment,
      });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 7. PUT /appointments/:id/cancel
router.put('/appointments/:id/cancel', async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const { cancelReason } = req.body;

    if (isDbConnected) {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status: 'cancelled', cancelReason: cancelReason || 'Cancelled by patient' },
        { new: true }
      );
      if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
      }
      return res.json({ success: true, message: 'Appointment cancelled', data: appointment });
    } else {
      const appointment = memoryStore.appointments.find((a) => a._id.toString() === appointmentId.toString());
      if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
      }
      appointment.status = 'cancelled';
      appointment.cancelReason = cancelReason || 'Cancelled by patient';
      appointment.updatedAt = new Date();
      return res.json({ success: true, message: 'Appointment cancelled', data: appointment });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 8. GET /health-metrics
router.get('/health-metrics', async (req: Request, res: Response) => {
  try {
    const patient = await getPatientProfile(req.user!.userId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const { metricType } = req.query;

    if (isDbConnected) {
      const filter: any = { patientId: patient._id };
      if (metricType) filter.metricType = metricType;
      const metrics = await HealthMetric.find(filter).sort({ recordedAt: -1 }).limit(100);
      return res.json({ success: true, data: metrics });
    } else {
      let metrics = memoryStore.healthMetrics.filter((m) => m.patientId.toString() === patient._id.toString());
      if (metricType) {
        metrics = metrics.filter((m) => m.metricType === metricType);
      }
      return res.json({ success: true, data: metrics });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 9. POST /health-metrics
router.post('/health-metrics', validateBody(logMetricSchema), async (req: Request, res: Response) => {
  try {
    const patient = await getPatientProfile(req.user!.userId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    const { metricType, value, unit, details, measuredBy } = req.body;

    // Automatic status evaluation based on clinical thresholds
    let status: 'normal' | 'elevated' | 'high' | 'critical' = 'normal';
    if (metricType === 'blood_glucose') {
      const numVal = typeof value === 'number' ? value : parseFloat(value);
      if (numVal > 180) status = 'critical';
      else if (numVal > 130) status = 'elevated';
      else status = 'normal';
    } else if (metricType === 'blood_pressure' && details?.systolic) {
      if (details.systolic > 160) status = 'critical';
      else if (details.systolic > 130) status = 'elevated';
      else status = 'normal';
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

    if (isDbConnected) {
      const metric = await HealthMetric.create(metricData);
      return res.status(201).json({ success: true, message: 'Metric recorded', data: metric });
    } else {
      const metric = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...metricData,
        createdAt: new Date(),
      };
      memoryStore.healthMetrics.unshift(metric);
      return res.status(201).json({ success: true, message: 'Metric recorded', data: metric });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 10. GET /consultations
router.get('/consultations', async (req: Request, res: Response) => {
  try {
    const patient = await getPatientProfile(req.user!.userId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    if (isDbConnected) {
      const consultations = await Consultation.find({ patientId: patient._id })
        .populate('doctorId', 'fullName specialty hospitalAffiliation')
        .sort({ createdAt: -1 });
      return res.json({ success: true, data: consultations });
    } else {
      const consultations = memoryStore.consultations.filter(
        (c) => c.patientId.toString() === patient._id.toString()
      );
      return res.json({ success: true, data: consultations });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
