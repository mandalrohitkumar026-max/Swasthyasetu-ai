import { Router, Request, Response } from 'express';
import { isDbConnected } from '../config/db';
import { Doctor } from '../models';
import { memoryStore } from '../services/store';

const router = Router();

// GET / - Public list of verified doctors with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { specialty, language, maxFee, search } = req.query;

    if (isDbConnected) {
      const query: any = { verificationStatus: 'verified' };

      if (specialty && specialty !== 'All') {
        query.specialty = new RegExp(specialty as string, 'i');
      }
      if (language && language !== 'All') {
        query.languages = new RegExp(language as string, 'i');
      }
      if (maxFee) {
        query.consultationFee = { $lte: parseFloat(maxFee as string) };
      }
      if (search) {
        query.$or = [
          { fullName: new RegExp(search as string, 'i') },
          { specialty: new RegExp(search as string, 'i') },
          { hospitalAffiliation: new RegExp(search as string, 'i') },
        ];
      }

      const doctors = await Doctor.find(query).select('-__v').sort({ rating: -1 });
      return res.json({ success: true, count: doctors.length, data: doctors });
    } else {
      let doctors = memoryStore.doctors.filter((d) => d.verificationStatus === 'verified');

      if (specialty && specialty !== 'All') {
        doctors = doctors.filter((d) => d.specialty.toLowerCase() === (specialty as string).toLowerCase());
      }
      if (language && language !== 'All') {
        doctors = doctors.filter((d) =>
          d.languages.some((l: string) => l.toLowerCase() === (language as string).toLowerCase())
        );
      }
      if (maxFee) {
        const fee = parseFloat(maxFee as string);
        doctors = doctors.filter((d) => d.consultationFee <= fee);
      }
      if (search) {
        const q = (search as string).toLowerCase();
        doctors = doctors.filter(
          (d) =>
            d.fullName.toLowerCase().includes(q) ||
            d.specialty.toLowerCase().includes(q) ||
            d.hospitalAffiliation.toLowerCase().includes(q)
        );
      }

      return res.json({ success: true, count: doctors.length, data: doctors });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /:id - Single doctor public profile
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id;

    if (isDbConnected) {
      const doctor = await Doctor.findById(doctorId).select('-__v');
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
      }
      return res.json({ success: true, data: doctor });
    } else {
      const doctor = memoryStore.doctors.find((d) => d._id.toString() === doctorId.toString());
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
      }
      return res.json({ success: true, data: doctor });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
