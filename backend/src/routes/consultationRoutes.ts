import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { isDbConnected } from '../config/db';
import { Consultation } from '../models';
import { memoryStore } from '../services/store';

const router = Router();

router.use(authenticateToken);

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const consultationId = req.params.id;

    if (isDbConnected) {
      const consultation = await Consultation.findById(consultationId)
        .populate('patientId', 'fullName gender dateOfBirth bloodGroup abhaId')
        .populate('doctorId', 'fullName specialty nmcRegistrationNumber');
      if (!consultation) {
        return res.status(404).json({ success: false, error: 'Consultation record not found' });
      }
      return res.json({ success: true, data: consultation });
    } else {
      const consultation = memoryStore.consultations.find((c) => c._id.toString() === consultationId.toString());
      if (!consultation) {
        return res.status(404).json({ success: false, error: 'Consultation record not found' });
      }
      return res.json({ success: true, data: consultation });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /appointment/:appointmentId
router.get('/appointment/:appointmentId', async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;

    if (isDbConnected) {
      const consultation = await Consultation.findOne({ appointmentId })
        .populate('patientId', 'fullName gender dateOfBirth bloodGroup abhaId')
        .populate('doctorId', 'fullName specialty nmcRegistrationNumber');
      if (!consultation) {
        return res.status(404).json({ success: false, error: 'No consultation found for this appointment' });
      }
      return res.json({ success: true, data: consultation });
    } else {
      const consultation = memoryStore.consultations.find(
        (c) => c.appointmentId.toString() === appointmentId.toString()
      );
      if (!consultation) {
        return res.status(404).json({ success: false, error: 'No consultation found for this appointment' });
      }
      return res.json({ success: true, data: consultation });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
