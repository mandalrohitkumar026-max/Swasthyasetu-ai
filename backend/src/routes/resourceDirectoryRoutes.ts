import { Router, Request, Response } from 'express';
import { resourceQuerySchema, uploadPhotoSchema } from '../validators/resourceValidator';
import { isDbConnected } from '../config/db';
import { HealthcareCenter } from '../models';
import { memoryStore } from '../services/store';
import { cacheService } from '../services/cacheService';

const router = Router();

// 1. GET /api/resources - 5-Tier Directory with Pagination & Low-Bandwidth Mode
router.get('/', async (req: Request, res: Response) => {
  try {
    const parsedQuery = resourceQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsedQuery.error.issues });
    }

    const { category, type, district, search, page, limit, sortBy, sortOrder, lite } = parsedQuery.data;

    // Check Cache
    const cacheKey = `res_dir:${category || 'all'}:${type || 'all'}:${district || 'all'}:${page}:${limit}:${search || ''}:${lite ? '1' : '0'}`;
    const cachedResponse = cacheService.get(cacheKey);
    if (cachedResponse) {
      return res.json({ ...(cachedResponse as any), fromCache: true });
    }

    let items: any[] = [];
    let totalCount = 0;

    if (isDbConnected) {
      const query: any = { isActive: true };
      if (category && category !== 'all') query.category = category;
      if (type) query.type = type;
      if (district && district !== 'All') query.district = new RegExp(district, 'i');
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { address: new RegExp(search, 'i') },
          { pincode: new RegExp(search, 'i') },
          { servicesOffered: new RegExp(search, 'i') },
        ];
      }

      totalCount = await HealthcareCenter.countDocuments(query);
      const sortObj: any = {};
      sortObj[sortBy || 'name'] = sortOrder === 'desc' ? -1 : 1;

      items = await HealthcareCenter.find(query)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      let filtered = memoryStore.healthcareCenters.filter((c) => c.isActive);
      if (category && category !== 'all') filtered = filtered.filter((c) => c.category === category);
      if (type) filtered = filtered.filter((c) => c.type === type);
      if (district && district !== 'All') {
        filtered = filtered.filter((c) => c.district.toLowerCase() === district.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.address.toLowerCase().includes(q) ||
            c.pincode.includes(q) ||
            (c.servicesOffered && c.servicesOffered.some((s: string) => s.toLowerCase().includes(q)))
        );
      }

      totalCount = filtered.length;
      filtered.sort((a, b) => {
        const valA = (a[sortBy] || a.name).toString().toLowerCase();
        const valB = (b[sortBy] || b.name).toString().toLowerCase();
        return sortOrder === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
      });

      items = filtered.slice((page - 1) * limit, page * limit);
    }

    // Low-Bandwidth 2G Optimization: Strip bulky objects to minimize packet size < 2KB
    let responseData = items;
    if (lite) {
      responseData = items.map((c) => ({
        _id: c._id,
        name: c.name,
        category: c.category,
        type: c.type,
        address: c.address,
        district: c.district,
        contactNumber: c.contactNumber,
        operatingHours: c.operatingHours,
        servicesCount: c.servicesOffered ? c.servicesOffered.length : 0,
        emergencyCasualtyAvailable: c.emergencyCasualtyAvailable,
      }));
    }

    const totalPages = Math.ceil(totalCount / limit);
    const result = {
      success: true,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
        isLowBandwidthMode: lite || false,
        cacheMetrics: cacheService.getMetrics(),
      },
      data: responseData,
    };

    // Cache result for 60 seconds
    cacheService.set(cacheKey, result, 60);

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET /api/resources/pricing-comparison - Published Tariff Comparison Index
router.get('/pricing-comparison', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'res_pricing_index';
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return res.json({ ...(cached as any), fromCache: true });
    }

    let allCenters: any[] = [];
    if (isDbConnected) {
      allCenters = await HealthcareCenter.find({ isActive: true });
    } else {
      allCenters = memoryStore.healthcareCenters;
    }

    const priceList: any[] = [];
    allCenters.forEach((center) => {
      if (center.publishedPricing && Array.isArray(center.publishedPricing)) {
        center.publishedPricing.forEach((p: any) => {
          const savingsAmount = Math.max(0, p.privateMarketAverageRate - p.governmentRate);
          const savingsPct =
            p.privateMarketAverageRate > 0
              ? Math.round((savingsAmount / p.privateMarketAverageRate) * 100)
              : 0;

          priceList.push({
            facilityName: center.name,
            facilityCategory: center.category,
            facilityType: center.type,
            district: center.district,
            serviceName: p.serviceName,
            governmentRate: p.governmentRate,
            privateMarketAverageRate: p.privateMarketAverageRate,
            isSubsidizedOrFree: p.isSubsidizedOrFree,
            estimatedSavingsPercentage: savingsPct,
            notes: p.notes,
          });
        });
      }
    });

    const result = {
      success: true,
      count: priceList.length,
      statutoryNotice: 'Published tariff rates are benchmarked against official National Health Mission (NHM) and Central Government Health Scheme (CGHS) approved tariffs.',
      data: priceList,
    };

    cacheService.set(cacheKey, result, 120);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /api/resources/categories - Category breakdown counts
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    let centers: any[] = [];
    if (isDbConnected) {
      centers = await HealthcareCenter.find({ isActive: true });
    } else {
      centers = memoryStore.healthcareCenters;
    }

    const categories = {
      clinic: centers.filter((c) => c.category === 'clinic').length,
      hospital: centers.filter((c) => c.category === 'hospital').length,
      diagnostic_lab: centers.filter((c) => c.category === 'diagnostic_lab').length,
      pharmacy: centers.filter((c) => c.category === 'pharmacy').length,
      government_resource: centers.filter((c) => c.category === 'government_resource').length,
    };

    return res.json({
      success: true,
      data: categories,
      totalActiveCenters: centers.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET /api/resources/:id - Facility profile
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const centerId = req.params.id;

    let center: any = null;
    if (isDbConnected) {
      center = await HealthcareCenter.findById(centerId);
    } else {
      center = memoryStore.healthcareCenters.find((c) => c._id.toString() === centerId.toString());
    }

    if (!center) {
      return res.status(404).json({ success: false, error: 'Healthcare facility not found' });
    }

    return res.json({ success: true, data: center });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. POST /api/resources/upload-photo - Scalable base64 image optimizer & CDN simulation
router.post('/upload-photo', async (req: Request, res: Response) => {
  try {
    const parsed = uploadPhotoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid photo payload', details: parsed.error.issues });
    }

    const { imageBase64, facilityId, description } = parsed.data;

    // Simulate high-compression WebP conversion
    const imageSizeBytes = Buffer.byteLength(imageBase64, 'utf8');
    const optimizedSizeBytes = Math.round(imageSizeBytes * 0.35); // 65% compression ratio

    const photoUri = `https://cdn.swasthyasetu.org/photos/${facilityId || 'gen'}-${Date.now()}.webp`;

    return res.status(201).json({
      success: true,
      message: 'Photo optimized and uploaded successfully',
      data: {
        photoUri,
        originalSizeBytes: imageSizeBytes,
        optimizedSizeBytes,
        compressionSavingsPercentage: 65,
        description: description || 'Facility verification photo',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
