import React, { useState, useEffect } from 'react';
import { PageId } from '../types/navigation';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  TrendingDown, 
  ChevronRight, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Activity, 
  FileText, 
  Layers, 
  Stethoscope, 
  Pill, 
  Building, 
  HeartHandshake,
  ArrowRight,
  WifiOff,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';
import { FALLBACK_HEALTHCARE_CENTERS, FALLBACK_CATEGORY_COUNTS } from '../data/seedResources';

interface ResourceDirectoryPageProps {
  onNavigate: (page: PageId, data?: any) => void;
}

export const ResourceDirectoryPage: React.FC<ResourceDirectoryPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiteMode, setIsLiteMode] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data states
  const [resources, setResources] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 6, totalCount: 0, totalPages: 1 });
  const [categoryCounts, setCategoryCounts] = useState<any>(FALLBACK_CATEGORY_COUNTS);
  const [pricingIndex, setPricingIndex] = useState<any[]>([]);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);

  // Photo upload modal state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadFacilityId, setUploadFacilityId] = useState<string>('');
  const [uploadDesc, setUploadDesc] = useState<string>('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Load Categories & Pricing Index on mount
  useEffect(() => {
    loadCategoryMeta();
    loadPricingData();
  }, []);

  // Reload Directory on filter change
  useEffect(() => {
    loadResources();
  }, [activeCategory, selectedDistrict, searchQuery, currentPage, isLiteMode]);

  const loadCategoryMeta = async () => {
    try {
      const res = await api.resources.getCategories();
      if (res.success && res.data) {
        setCategoryCounts(res.data);
      } else {
        setCategoryCounts(FALLBACK_CATEGORY_COUNTS);
      }
    } catch (err) {
      console.warn('Backend unavailable, using fallback category counts', err);
      setCategoryCounts(FALLBACK_CATEGORY_COUNTS);
    }
  };

  const loadPricingData = async () => {
    try {
      const res = await api.resources.getPriceComparison();
      if (res.success && res.data) {
        setPricingIndex(res.data);
      }
    } catch (err) {
      console.warn('Backend unavailable for pricing index, using local tariff data', err);
      // Construct pricing list from fallback centers
      const tariffs: any[] = [];
      FALLBACK_HEALTHCARE_CENTERS.forEach(center => {
        center.publishedPricing.forEach(p => {
          tariffs.push({
            facilityName: center.name,
            district: center.district,
            category: center.category,
            ...p
          });
        });
      });
      setPricingIndex(tariffs);
    }
  };

  const applyFallbackFilters = () => {
    let list = [...FALLBACK_HEALTHCARE_CENTERS];
    if (activeCategory && activeCategory !== 'all') {
      list = list.filter((c) => c.category === activeCategory);
    }
    if (selectedDistrict && selectedDistrict !== 'All') {
      list = list.filter((c) => c.district.toLowerCase() === selectedDistrict.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.pincode.includes(q) ||
          c.servicesOffered.some((s) => s.toLowerCase().includes(q))
      );
    }
    const startIndex = (currentPage - 1) * 6;
    const paginated = list.slice(startIndex, startIndex + 6);
    setResources(paginated);
    setPagination({
      page: currentPage,
      limit: 6,
      totalCount: list.length,
      totalPages: Math.ceil(list.length / 6) || 1,
      hasMore: startIndex + 6 < list.length,
    });
    setIsOfflineFallback(true);
  };

  const loadResources = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.resources.getDirectory({
        category: activeCategory,
        district: selectedDistrict,
        search: searchQuery,
        page: currentPage,
        limit: 6,
        lite: isLiteMode,
      });

      if (res.success && res.data && res.data.length >= 0) {
        setResources(res.data);
        if (res.meta) {
          setPagination(res.meta);
        }
        setIsOfflineFallback(false);
      } else {
        applyFallbackFilters();
      }
    } catch (err: any) {
      console.warn('Failed to reach backend, engaging offline resilient cache', err);
      applyFallbackFilters();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitPhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview) return;

    setIsUploading(true);
    setUploadStatus(null);
    try {
      const res = await api.resources.uploadPhoto(uploadPreview, uploadFacilityId, uploadDesc);
      if (res.success) {
        setUploadStatus('Facility photograph compressed and published successfully!');
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadPreview(null);
          setUploadDesc('');
          setUploadStatus(null);
        }, 1800);
      } else {
        setUploadStatus(`Upload failed: ${res.error}`);
      }
    } catch (err: any) {
      setUploadStatus(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Resources', icon: <Layers className="w-4 h-4" />, count: (categoryCounts.clinic || 0) + (categoryCounts.hospital || 0) + (categoryCounts.diagnostic_lab || 0) + (categoryCounts.pharmacy || 0) + (categoryCounts.government_resource || 0) },
    { id: 'hospital', label: 'Civil Hospitals', icon: <Building className="w-4 h-4" />, count: categoryCounts.hospital || 0 },
    { id: 'clinic', label: 'PHC & Wellness Centers', icon: <Stethoscope className="w-4 h-4" />, count: categoryCounts.clinic || 0 },
    { id: 'diagnostic_lab', label: 'Diagnostic Labs', icon: <Activity className="w-4 h-4" />, count: categoryCounts.diagnostic_lab || 0 },
    { id: 'pharmacy', label: 'Jan Aushadhi Pharmacies', icon: <Pill className="w-4 h-4" />, count: categoryCounts.pharmacy || 0 },
    { id: 'government_resource', label: 'Govt Helplines & Kiosks', icon: <ShieldCheck className="w-4 h-4" />, count: categoryCounts.government_resource || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-sky-800 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Public Healthcare Directory & Price Index
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-slate-100 text-xs font-semibold px-3 py-1 rounded-full">
              NHM & CGHS Benchmarked
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Affordable Healthcare Discovery & Transparent Tariffs
          </h1>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Locate zero-cost primary health centres, subsidized PMBJP pharmacies, free NABL diagnostic labs, and Tele-MANAS counselling facilities across both rural and urban districts.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowPricingModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all"
            >
              <TrendingDown className="w-4 h-4" />
              View Published Price Comparison (Up to 90% Savings)
            </button>

            <button
              onClick={() => onNavigate('rural-access')}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-xl text-sm font-semibold backdrop-blur-xs transition-all border border-white/20"
            >
              <WifiOff className="w-4 h-4 text-cyan-300" />
              Switch to Rural 2G Mode & Education
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, District and 2G Lite Mode Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search facility name, address, services (e.g. dialysis, insulin, ultrasound)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Districts</option>
              <option value="Sitapur">Sitapur (Rural Pilot)</option>
              <option value="Lucknow">Lucknow (Urban Hub)</option>
              <option value="Hardoi">Hardoi</option>
              <option value="Lakhimpur Kheri">Lakhimpur Kheri</option>
              <option value="Varanasi">Varanasi</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={isLiteMode}
                onChange={(e) => setIsLiteMode(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span>2G Lite Mode (&lt;2KB)</span>
            </label>

            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-2 rounded-xl transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Contribute Photo</span>
            </button>
          </div>

        </div>

      </div>

      {/* Offline Resilient Notice if server is offline or loading local cache */}
      {isOfflineFallback && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <WifiOff className="w-4 h-4 text-amber-700" />
                Resilient Offline Cache Active
              </p>
              <p className="text-[11px] sm:text-xs text-amber-700 font-medium">
                Displaying verified local healthcare directory entries with full search, tariff comparisons and zero downtime.
              </p>
            </div>
          </div>
          <button
            onClick={loadResources}
            className="self-start sm:self-auto text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-xl shadow-xs transition"
          >
            Sync Live Network
          </button>
        </div>
      )}

      {/* Directory Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Retrieving verified healthcare resources...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="font-semibold">{errorMsg}</p>
          <button
            onClick={loadResources}
            className="text-xs bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700"
          >
            Retry Request
          </button>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Healthcare Facilities Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria or clear district filters to explore healthcare centres in nearby clusters.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSelectedDistrict('All');
              setSearchQuery('');
            }}
            className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl font-semibold hover:bg-teal-100"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((facility: any) => {
            const isGov = facility.category === 'government_resource' || facility.type === 'civil_hospital' || facility.type === 'primary_health_center';
            return (
              <div
                key={facility._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-200 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                      {facility.category?.replace('_', ' ')}
                    </span>
                    {facility.emergencyCasualtyAvailable && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <Flame className="w-3 h-3 text-rose-600" />
                        24/7 Casualty
                      </span>
                    )}
                  </div>

                  {/* Title & Type */}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 line-clamp-2">
                      {facility.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium capitalize">
                      {facility.type?.replace(/_/g, ' ')}
                    </p>
                  </div>

                  {/* Location & Contact */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{facility.address}, {facility.district}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{facility.operatingHours || '08:00 AM - 04:00 PM'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a 
                        href={`tel:${facility.contactNumber}`} 
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {facility.contactNumber}
                      </a>
                    </div>
                  </div>

                  {/* Services / Lite preview */}
                  {!isLiteMode && facility.servicesOffered && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Key Services ({facility.servicesOffered.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {facility.servicesOffered.slice(0, 4).map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {s}
                          </span>
                        ))}
                        {facility.servicesOffered.length > 4 && (
                          <span className="text-[11px] text-teal-700 font-semibold px-1 py-0.5">
                            +{facility.servicesOffered.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Published Pricing Highlights */}
                  {!isLiteMode && facility.publishedPricing && facility.publishedPricing.length > 0 && (
                    <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-2.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-semibold text-emerald-900">
                        <span>{facility.publishedPricing[0].serviceName}</span>
                        <span>
                          {facility.publishedPricing[0].governmentRate === 0 
                            ? 'FREE (Govt)' 
                            : `₹${facility.publishedPricing[0].governmentRate}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-700">
                        Private market rate: ₹{facility.publishedPricing[0].privateMarketAverageRate} • 
                        Savings: {Math.round(((facility.publishedPricing[0].privateMarketAverageRate - facility.publishedPricing[0].governmentRate) / facility.publishedPricing[0].privateMarketAverageRate) * 100)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${facility.contactNumber}`}
                    className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors flex-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Facility</span>
                  </a>

                  <button
                    onClick={() => {
                      onNavigate('telemedicine', {
                        centerId: facility._id,
                        centerName: facility.name,
                        district: facility.district,
                      });
                    }}
                    className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-2 rounded-xl shadow-xs transition-colors flex-1"
                  >
                    <span>Consult Online</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-5">
          <p className="text-xs text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-700">{pagination.page}</span> of{' '}
            <span className="font-bold text-slate-700">{pagination.totalPages}</span> ({pagination.totalCount} total resources)
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: Published Price Comparison Matrix */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  National Health Mission & CGHS Published Benchmarks
                </span>
                <h2 className="text-xl font-extrabold">Official Healthcare Tariffs vs. Private Market Rates</h2>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  All prices are official statutory rates prescribed by the Ministry of Health and Family Welfare, Government of India. Primary Health Centre and Civil Hospital consultations are 100% free under Ayushman Arogya Mandir.
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Clinical Procedure / Service</th>
                      <th className="py-3 px-4">Affordable / Govt Fee</th>
                      <th className="py-3 px-4">Private Market Rate</th>
                      <th className="py-3 px-4">Citizen Savings</th>
                      <th className="py-3 px-4">Facility & Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pricingIndex.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.serviceName}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                            {item.governmentRate === 0 ? 'FREE' : `₹${item.governmentRate}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 line-through">₹{item.privateMarketAverageRate}</td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-emerald-600">
                            {item.estimatedSavingsPercentage}% Save
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500">
                          {item.facilityName} ({item.district})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPricingModal(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-semibold"
              >
                Close Comparison Table
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Contribute Facility Photo */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">Upload Healthcare Facility Photo</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitPhotoUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Facility</label>
                <select
                  value={uploadFacilityId}
                  onChange={(e) => setUploadFacilityId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Choose Center (Optional) --</option>
                  {resources.map((r) => (
                    <option key={r._id} value={r._id}>{r.name} ({r.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Description / Landmark</label>
                <input
                  type="text"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="e.g. Front entrance showing Ayushman Arogya Mandir board"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Photo File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
              </div>

              {uploadPreview && (
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100 flex items-center justify-center">
                  <img src={uploadPreview} alt="Preview" className="max-h-48 object-contain" />
                </div>
              )}

              {uploadStatus && (
                <p className="text-xs font-medium text-teal-700 bg-teal-50 p-2.5 rounded-xl border border-teal-200">
                  {uploadStatus}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadPreview || isUploading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isUploading ? 'Compressing & Uploading...' : 'Upload & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default ResourceDirectoryPage;
