import { Router, Request, Response } from 'express';
import { mockMedicines, mockKendras } from '../data/mockData';

const router = Router();

// 1. Search medicines
router.get('/medicines', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  if (!query) {
    return res.json(mockMedicines);
  }

  const filtered = mockMedicines.filter(m => 
    m.brandName.toLowerCase().includes(query) ||
    m.genericSalt.toLowerCase().includes(query) ||
    m.indications.some(ind => ind.toLowerCase().includes(query))
  );

  return res.json(filtered);
});

// 2. Compare brand vs generic savings
router.get('/compare/:id', (req: Request, res: Response) => {
  const medicine = mockMedicines.find(m => m.id === req.params.id);
  if (!medicine) {
    return res.status(404).json({ error: "Medicine not found in catalog" });
  }

  const monthlyQuantity = 30; // standard 1-month supply
  const brandedMonthlyCost = medicine.brandedPrice;
  const genericMonthlyCost = medicine.janAushadhiPrice;
  const rupeeSavings = brandedMonthlyCost - genericMonthlyCost;
  const annualSavings = rupeeSavings * 12;

  return res.json({
    medicine,
    costBreakdown: {
      brandedUnitPrice: medicine.brandedPrice,
      janAushadhiUnitPrice: medicine.janAushadhiPrice,
      unitSavings: rupeeSavings,
      savingsPercentage: medicine.savingsPercentage,
      estimatedMonthlySavings: rupeeSavings,
      estimatedAnnualSavings: annualSavings
    },
    bioequivalentGuarantee: "Certified 100% Active Pharmaceutical Ingredient (API) Bioequivalent under Bureau of Pharma PSUs of India (BPPI) quality norms."
  });
});

// 3. Nearby Jan Aushadhi Kendras
router.get('/kendras', (req: Request, res: Response) => {
  const district = (req.query.district as string || '').toLowerCase();
  if (district) {
    const filtered = mockKendras.filter(k => k.district.toLowerCase().includes(district));
    return res.json(filtered.length ? filtered : mockKendras);
  }
  return res.json(mockKendras);
});

// 4. Simulated Prescription OCR Parser
router.post('/ocr-scan', (req: Request, res: Response) => {
  const { sampleText } = req.body;
  const rawText = sampleText || "Rx: Tab Augmentin 625 1-0-1 x 5 days, Tab Pan D 1-0-0 empty stomach x 10 days, Tab Glycomet GP2 1 tab daily morning.";

  const detectedMedicines = [];
  let totalBrandedCost = 0;
  let totalJanAushadhiCost = 0;

  for (const med of mockMedicines) {
    // Check if brand or salt keywords appear in rawText
    const nameMatch = new RegExp(med.brandName.split(' ')[0], 'i').test(rawText);
    const saltMatch = new RegExp(med.genericSalt.split(' ')[0], 'i').test(rawText);
    
    if (nameMatch || saltMatch) {
      detectedMedicines.push({
        detectedSnippet: med.brandName,
        matchedMedicine: med,
        recommendedDosage: "As per physician instructions",
        genericAlternative: med.genericSalt,
        savingsPercentage: med.savingsPercentage
      });
      totalBrandedCost += med.brandedPrice;
      totalJanAushadhiCost += med.janAushadhiPrice;
    }
  }

  return res.json({
    rawInputProcessed: rawText,
    ocrConfidence: "98.4%",
    detectedMedicines,
    financialSummary: {
      totalBrandedCost: totalBrandedCost.toFixed(2),
      totalJanAushadhiCost: totalJanAushadhiCost.toFixed(2),
      totalRupeeSavings: (totalBrandedCost - totalJanAushadhiCost).toFixed(2),
      overallSavingsPercent: totalBrandedCost > 0 ? (((totalBrandedCost - totalJanAushadhiCost) / totalBrandedCost) * 100).toFixed(1) : "0"
    }
  });
});

export default router;
