import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  updateDoctorProfileSchema,
  updateAppointmentStatusSchema,
  createConsultationSchema,
} from '../validators/doctorValidator';
import { isDbConnected } from '../config/db';
import { Doctor, Appointment, Patient, MedicalRecord, Consultation } from '../models';
import { memoryStore } from '../services/store';

const router = Router();

// Middleware: all routes here require doctor or admin role
router.use(authenticateToken);
router.use(requireRole(['doctor', 'admin']));

// Helper to resolve doctor profile from authenticated user
const getDoctorProfile = async (userId: string) => {
  if (isDbConnected) {
    return await Doctor.findOne({ userId });
  }
  return memoryStore.doctors.find((d) => d.userId.toString() === userId.toString());
};

// 1. GET /me - Doctor Profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctorProfile(req.user!.userId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }
    return res.json({ success: true, data: doctor });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. PUT /me - Update Doctor Profile
router.put('/me', validateBody(updateDoctorProfileSchema), async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    if (isDbConnected) {
      const doctor = await Doctor.findOneAndUpdate(
        { userId: req.user!.userId },
        { $set: updates },
        { new: true }
      );
      return res.json({ success: true, message: 'Doctor profile updated', data: doctor });
    } else {
      const doctor = memoryStore.doctors.find((d) => d.userId.toString() === req.user!.userId.toString());
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor profile not found' });
      }
      Object.assign(doctor, updates, { updatedAt: new Date() });
      return res.json({ success: true, message: 'Doctor profile updated', data: doctor });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /appointments - Doctor's OPD Queue
router.get('/appointments', async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctorProfile(req.user!.userId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    const { status, date } = req.query;

    if (isDbConnected) {
      const query: any = { doctorId: doctor._id };
      if (status) query.status = status;
      if (date) query.date = date;

      const appointments = await Appointment.find(query)
        .populate('patientId', 'fullName gender dateOfBirth bloodGroup abhaId address allergies')
        .sort({ date: 1, timeSlot: 1 });
      return res.json({ success: true, data: appointments });
    } else {
      let appointments = memoryStore.appointments.filter(
        (a) => a.doctorId.toString() === doctor._id.toString()
      );
      if (status) appointments = appointments.filter((a) => a.status === status);
      if (date) appointments = appointments.filter((a) => a.date === date);

      return res.json({ success: true, data: appointments });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. PUT /appointments/:id/status - Update Consultation Status
router.put('/appointments/:id/status', validateBody(updateAppointmentStatusSchema), async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const { status, cancelReason } = req.body;

    if (isDbConnected) {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status, ...(cancelReason ? { cancelReason } : {}) },
        { new: true }
      );
      if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
      }
      return res.json({ success: true, message: `Appointment status updated to ${status}`, data: appointment });
    } else {
      const appointment = memoryStore.appointments.find((a) => a._id.toString() === appointmentId.toString());
      if (!appointment) {
        return res.status(404).json({ success: false, error: 'Appointment not found' });
      }
      appointment.status = status;
      if (cancelReason) appointment.cancelReason = cancelReason;
      appointment.updatedAt = new Date();
      return res.json({ success: true, message: `Appointment status updated to ${status}`, data: appointment });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET /patients/:patientId/records - Access Authorized Patient Records
router.get('/patients/:patientId/records', async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctorProfile(req.user!.userId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    const { patientId } = req.params;

    // Verify appointment relationship or authorization (DPDP Consent check)
    let hasAppointment = false;
    if (isDbConnected) {
      const appt = await Appointment.findOne({ doctorId: doctor._id, patientId });
      hasAppointment = !!appt;
    } else {
      hasAppointment = memoryStore.appointments.some(
        (a) => a.doctorId.toString() === doctor._id.toString() && a.patientId.toString() === patientId.toString()
      );
    }

    if (!hasAppointment && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Patient records access denied: DPDP Act requires an active appointment or patient consent token.',
      });
    }

    if (isDbConnected) {
      const patient = await Patient.findById(patientId);
      const records = await MedicalRecord.find({ patientId }).sort({ createdAt: -1 });
      return res.json({
        success: true,
        data: {
          patient,
          records,
        },
      });
    } else {
      const patient = memoryStore.patients.find((p) => p._id.toString() === patientId.toString());
      const records = memoryStore.medicalRecords.filter((r) => r.patientId.toString() === patientId.toString());
      return res.json({
        success: true,
        data: {
          patient,
          records,
        },
      });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. POST /consultations - Create Clinical Note & Digital E-Prescription
router.post('/consultations', validateBody(createConsultationSchema), async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctorProfile(req.user!.userId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    const {
      appointmentId,
      patientId,
      chiefComplaint,
      clinicalNotes,
      symptoms,
      diagnosis,
      prescription,
      vitals,
      followUpDate,
      callDurationSeconds,
    } = req.body;

    // Create cryptographic digital signature
    const signaturePayload = `${doctor.fullName}|${doctor.nmcRegistrationNumber}|${patientId}|${Date.now()}`;
    const signatureHash = 'sha256-' + crypto.createHash('sha256').update(signaturePayload).digest('hex').substring(0, 32);

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

    let savedConsultation: any = null;

    if (isDbConnected) {
      savedConsultation = await Consultation.create(consultationData);

      // Mark appointment as completed
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });

      // Automatically add a MedicalRecord prescription entry for the patient
      await MedicalRecord.create({
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
                  text: prescription.map((p: any) => p.genericSalt).join(', '),
                },
              },
            },
          ],
        },
      });
    } else {
      savedConsultation = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...consultationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.consultations.unshift(savedConsultation);

      // Update appointment in memory
      const appt = memoryStore.appointments.find((a) => a._id.toString() === appointmentId.toString());
      if (appt) {
        appt.status = 'completed';
        appt.updatedAt = new Date();
      }

      // Add medical record in memory
      memoryStore.medicalRecords.unshift({
        _id: new mongoose.Types.ObjectId().toString(),
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
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 7. GET /consultations/:id
router.get('/consultations/:id', async (req: Request, res: Response) => {
  try {
    const consultationId = req.params.id;

    if (isDbConnected) {
      const consultation = await Consultation.findById(consultationId)
        .populate('patientId', 'fullName gender dateOfBirth bloodGroup abhaId')
        .populate('doctorId', 'fullName specialty nmcRegistrationNumber');
      if (!consultation) {
        return res.status(404).json({ success: false, error: 'Consultation not found' });
      }
      return res.json({ success: true, data: consultation });
    } else {
      const consultation = memoryStore.consultations.find((c) => c._id.toString() === consultationId.toString());
      if (!consultation) {
        return res.status(404).json({ success: false, error: 'Consultation not found' });
      }
      return res.json({ success: true, data: consultation });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
