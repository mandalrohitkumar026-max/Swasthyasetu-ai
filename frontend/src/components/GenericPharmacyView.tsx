import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  Percent, 
  Sparkles, 
  CheckCircle2, 
  ScanLine, 
  ExternalLink,
  ShieldCheck,
  Building
} from 'lucide-react';
import { JanAushadhiKendra, MedicineItem } from '../types';
import { api } from '../services/api';

export const GenericPharmacyView: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [kendras, setKendras] = useState<JanAushadhiKendra[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Sitapur');
  
  // OCR Scanner Simulator State
  const [ocrText, setOcrText] = useState(
    'Rx:\n1. Tab Augmentin 625 Duo (1-0-1) x 5 days\n2. Tab Pan-D 40/30 (1-0-0 empty stomach) x 15 days\n3. Tab Glycomet-GP2 (1-0-0 before breakfast) x 30 days'
  );
  const [ocrResults, setOcrResults] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meds, kens] = await Promise.all([
        api.getMedicines(),
        api.getKendras(selectedDistrict)
      ]);
      setMedicines(meds);
      setKendras(kens);
    } catch (err) {
      console.error("Failed to load pharmacy data", err);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const res = await api.getMedicines(query);
      setMedicines(res);
    } catch (err) {
      console.error("Medicine search failed", err);
    }
  };

  const handleDistrictChange = async (dist: string) => {
    setSelectedDistrict(dist);
    try {
      const res = await api.getKendras(dist);
      setKendras(res);
    } catch (err) {
      console.error("Failed to load kendras", err);
    }
  };

  const handleRunOcr = async () => {
    setIsScanning(true);
    try {
      const res = await api.scanPrescriptionOcr(ocrText);
      setOcrResults(res);
    } catch (err) {
      console.error("OCR scan failed", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PMBJP & Jan Aushadhi Affordability Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Generic Medicine & Jan Aushadhi Substitution
          </h1>
          <p className="mt-2 text-slate-200 text-xs sm:text-sm leading-relaxed">
            Eliminating catastrophic healthcare expenses. Save 70% to 85% on verified, active-pharmaceutical-ingredient (API) bioequivalent medicines certified by the Bureau of Pharma PSUs of India (BPPI).
          </p>
        </div>
      </div>

      {/* Section 1: Prescription OCR & Vision AI Scanner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <ScanLine className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Prescription OCR Scanner (Vision AI)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste or simulate scanning a handwritten doctor prescription to automatically detect branded drugs and compute Jan Aushadhi generic savings.
            </p>
          </div>
          <button
            onClick={handleRunOcr}
            disabled={isScanning || !ocrText.trim()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
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
          <div className="lg:col-span-6">
            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
              Prescription Input (Doctor Handwritten / Printed Text)
            </label>
            <textarea
              rows={4}
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="lg:col-span-6">
            {ocrResults ? (
              <div className="bg-emerald-50/80 rounded-2xl border border-emerald-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    OCR Detected {ocrResults.detectedMedicines.length} Medicines (Confidence: {ocrResults.ocrConfidence})
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded">
                    Save {ocrResults.financialSummary.overallSavingsPercent}%
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {ocrResults.detectedMedicines.map((m: any, idx: number) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-100 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{m.matchedMedicine.brandName}</span>
                        <div className="text-[10px] text-slate-500">{m.matchedMedicine.genericSalt}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 line-through">₹{m.matchedMedicine.brandedPrice}</span>
                        <div className="font-extrabold text-emerald-700 text-xs">₹{m.matchedMedicine.janAushadhiPrice}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Total Branded: ₹{ocrResults.financialSummary.totalBrandedCost}</span>
                  <span className="text-emerald-700">Jan Aushadhi: ₹{ocrResults.financialSummary.totalJanAushadhiCost}</span>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                    Total Rupee Savings: ₹{ocrResults.financialSummary.totalRupeeSavings}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[120px] bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                <ScanLine className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500">Tap "Process Prescription OCR" to extract medicines and view instant savings.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Medicine Price Comparator Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              Branded vs Generic Bioequivalent Price Comparator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All generic medicines correspond 1:1 to the National List of Essential Medicines (NLEM).
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by brand or chemical salt..."
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Medicines Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Branded Formulation</th>
                <th className="py-3 px-4">Active Generic Salt (Bioequivalent)</th>
                <th className="py-3 px-4">Branded MRP</th>
                <th className="py-3 px-4">Jan Aushadhi Price</th>
                <th className="py-3 px-4 text-center">Patient Savings</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-all">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{m.brandName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{m.manufacturer} • {m.form}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{m.genericSalt}</div>
                    <div className="text-[10px] text-emerald-700 font-mono">{m.janAushadhiCode}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold line-through text-slate-400">
                    ₹{m.brandedPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                    ₹{m.janAushadhiPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-full">
                      {m.savingsPercentage}% Saved
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
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

      {/* Section 3: Jan Aushadhi Kendra Locator */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              Nearest Pradhan Mantri Bhartiya Janaushadhi Kendras
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Locate government-certified generic pharmacies nearby for medicine pickup.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Sitapur">Sitapur (Uttar Pradesh)</option>
              <option value="Bengaluru">Bengaluru (Karnataka)</option>
              <option value="Lucknow">Lucknow (Uttar Pradesh)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kendras.map(kendra => (
            <div key={kendra.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{kendra.name}</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {kendra.distanceKm} km away
                </span>
              </div>

              <div className="flex items-start gap-1.5 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{kendra.address}, {kendra.district} - {kendra.pincode}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-emerald-700">{kendra.contactNumber}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
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

    </div>
  );
};
