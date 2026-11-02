import { Router, Request, Response } from 'express';
import { isDbConnected } from '../config/db';
import { HealthcareCenter } from '../models';
import { memoryStore } from '../services/store';

const router = Router();

// GET / - Public search & filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const { district, type, search } = req.query;

    if (isDbConnected) {
      const query: any = { isActive: true };
      if (district && district !== 'All') {
        query.district = new RegExp(district as string, 'i');
      }
      if (type && type !== 'All') {
        query.type = type;
      }
      if (search) {
        query.$or = [
          { name: new RegExp(search as string, 'i') },
          { address: new RegExp(search as string, 'i') },
          { pincode: new RegExp(search as string, 'i') },
        ];
      }

      const centers = await HealthcareCenter.find(query).sort({ name: 1 });
      return res.json({ success: true, count: centers.length, data: centers });
    } else {
      let centers = memoryStore.healthcareCenters.filter((c) => c.isActive);
      if (district && district !== 'All') {
        centers = centers.filter((c) => c.district.toLowerCase() === (district as string).toLowerCase());
      }
      if (type && type !== 'All') {
        centers = centers.filter((c) => c.type === type);
      }
      if (search) {
        const q = (search as string).toLowerCase();
        centers = centers.filter(
          (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.pincode.includes(q)
        );
      }

      return res.json({ success: true, count: centers.length, data: centers });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const centerId = req.params.id;

    if (isDbConnected) {
      const center = await HealthcareCenter.findById(centerId);
      if (!center) {
        return res.status(404).json({ success: false, error: 'Healthcare center not found' });
      }
      return res.json({ success: true, data: center });
    } else {
      const center = memoryStore.healthcareCenters.find((c) => c._id.toString() === centerId.toString());
      if (!center) {
        return res.status(404).json({ success: false, error: 'Healthcare center not found' });
      }
      return res.json({ success: true, data: center });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
