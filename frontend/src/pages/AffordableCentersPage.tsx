import React, { useState, useEffect } from 'react';
import { PageId } from '../types/navigation';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Pill, 
  Search, 
  ScanLine, 
  CheckCircle2, 
  Percent, 
  Sparkles,
  ShieldCheck,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { JanAushadhiKendra, MedicineItem } from '../types';

interface AffordableCentersPageProps {
  onNavigate: (page: PageId) => void;
}

export const AffordableCentersPage: React.FC<AffordableCentersPageProps> = () => {
  const [kendras, setKendras] = useState<JanAushadhiKendra[]>([]);
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Sitapur');
  const [searchQuery, setSearchQuery] = useState('');
  
  // OCR State
  const [ocrInput, setOcrInput] = useState(
    'Rx: 1. Tab Augmentin 625 Duo (1-0-1) x 5 days\n2. Tab Pan-D 40/30 (1-0-0 empty stomach) x 15 days\n3. Tab Glycomet-GP2 (1-0-0 before breakfast) x 30 days'
  );
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDistrict]);

  const loadData = async () => {
    try {
      const [aiCare, m] = await Promise.all([
        api.ai.getAffordableCare({ district: selectedDistrict, max_distance_km: 40 }).catch(() => null),
        api.getMedicines().catch(() => [])
      ]);

      if (aiCare && aiCare.recommended_centers && aiCare.recommended_centers.length > 0) {
        const mappedKendras: JanAushadhiKendra[] = aiCare.recommended_centers.map((c: any) => ({
          id: c.center_id,
          name: c.name,
          address: c.address,
          district: c.district,
          state: 'Uttar Pradesh',
          pincode: '261141',
          contactNumber: c.contact_phone,
          operatingHours: c.operating_hours,
          latitude: 27.5706,
          longitude: 80.6776,
          distanceKm: c.distance_km,
          rating: c.kiosk_uptime_pct ? 4.9 : 4.8,
          inStockCount: 450
        }));
        setKendras(mappedKendras);
      } else {
        const k = await api.getKendras(selectedDistrict);
        setKendras(k);
      }
      setMedicines(m);
    } catch (err) {
      console.error("Failed to load centers data", err);
    }
  };

  const handleRunOcr = async () => {
    setIsScanning(true);
    try {
      const res = await api.scanPrescriptionOcr(ocrInput);
      setOcrResult(res);
    } catch (err) {
      console.error("OCR scan failed", err);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredMeds = medicines.filter(m => 
    m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genericSalt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-3">
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          PMBJP & Public Primary Health Center Network
        </span>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Affordable Healthcare Centers & Jan Aushadhi Kendras
        </h1>
        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-3xl">
          Locate certified government generic pharmacies, Primary Health Centers (PHCs), and Community Health Centers (CHCs) to access affordable consultations and save 70% to 85% on verified medications.
        </p>
      </div>

      {/* 1. Nearest Jan Aushadhi Kendras & PHCs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              Government Jan Aushadhi Kendras & PHC Hubs
            </h2>
            <p className="text-xs text-slate-500">Certified by the Bureau of Pharma PSUs of India (BPPI)</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600">Select District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
            >
              <option value="Sitapur">Sitapur (Uttar Pradesh)</option>
              <option value="Lucknow">Lucknow (Uttar Pradesh)</option>
              <option value="Bengaluru">Bengaluru (Karnataka)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kendras.map(kendra => (
            <div key={kendra.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-900">{kendra.name}</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                  {kendra.distanceKm} km away
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{kendra.address}, {kendra.district} - {kendra.pincode}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-teal-700">{kendra.contactNumber}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {kendra.operatingHours}
                </span>
                <span className="font-bold text-amber-600">★ {kendra.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Prescription OCR Scanner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-teal-600" />
              Prescription OCR Vision Scanner
            </h2>
            <p className="text-xs text-slate-500">
              Paste or simulate scanning a handwritten prescription to automatically match bioequivalent generic salts.
            </p>
          </div>

          <button
            onClick={handleRunOcr}
            disabled={isScanning}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            {isScanning ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ScanLine className="w-3.5 h-3.5" />
            )}
            <span>Process Prescription OCR</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase block">Doctor Prescription Text</label>
            <textarea
              rows={4}
              value={ocrInput}
              onChange={(e) => setOcrInput(e.target.value)}
              className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:bg-white resize-none"
            />
          </div>

          <div className="lg:col-span-6">
            {ocrResult ? (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Detected {ocrResult.detectedMedicines.length} Medicines ({ocrResult.ocrConfidence} confidence)
                  </span>
                  <span className="font-black text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded">
                    Save {ocrResult.financialSummary.overallSavingsPercent}%
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {ocrResult.detectedMedicines.map((m: any, idx: number) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-100 text-xs flex justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{m.matchedMedicine.brandName}</div>
                        <div className="text-[10px] text-slate-500">{m.matchedMedicine.genericSalt}</div>
                      </div>
                      <div className="text-right">
                        <span className="line-through text-[10px] text-slate-400">₹{m.matchedMedicine.brandedPrice}</span>
                        <div className="font-bold text-emerald-700">₹{m.matchedMedicine.janAushadhiPrice}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-emerald-200 flex justify-between text-xs font-bold text-emerald-950">
                  <span>Branded Total: ₹{ocrResult.financialSummary.totalBrandedCost}</span>
                  <span className="text-emerald-700">Jan Aushadhi: ₹{ocrResult.financialSummary.totalJanAushadhiCost}</span>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded">
                    Savings: ₹{ocrResult.financialSummary.totalRupeeSavings}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[140px] bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-500">Click "Process Prescription OCR" above to extract drug salts and compute savings.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Medicine Price Comparator Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              Jan Aushadhi Generic Medicine Registry
            </h2>
            <p className="text-xs text-slate-500">100% API bioequivalent formulations compared against branded retail MRP</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand or chemical salt..."
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Branded Drug</th>
                <th className="py-3 px-4">Generic Active Salt</th>
                <th className="py-3 px-4">Branded MRP</th>
                <th className="py-3 px-4">Jan Aushadhi Price</th>
                <th className="py-3 px-4 text-center">You Save</th>
                <th className="py-3 px-4">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMeds.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{m.brandName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{m.manufacturer}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{m.genericSalt}</div>
                    <div className="text-[10px] text-emerald-700 font-mono">{m.janAushadhiCode}</div>
                  </td>
                  <td className="py-3 px-4 line-through text-slate-400 font-semibold">₹{m.brandedPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 font-black text-emerald-700 text-sm">₹{m.janAushadhiPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                      {m.savingsPercentage}% Off
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      In Stock
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
