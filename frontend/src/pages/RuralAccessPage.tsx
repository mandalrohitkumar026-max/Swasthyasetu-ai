import React, { useState, useEffect } from 'react';
import { PageId } from '../types/navigation';
import { 
  Wifi, 
  WifiOff, 
  PhoneCall, 
  Heart, 
  BookOpen, 
  Radio, 
  MapPin, 
  CheckSquare, 
  Sparkles, 
  ShieldCheck, 
  Globe2, 
  Download, 
  Clock, 
  Phone, 
  ArrowRight, 
  Baby, 
  Activity, 
  Droplet, 
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api';

interface RuralAccessPageProps {
  onNavigate: (page: PageId, data?: any) => void;
}

export const RuralAccessPage: React.FC<RuralAccessPageProps> = ({ onNavigate }) => {
  const [lang, setLang] = useState<'en' | 'hi'>('hi');
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState<boolean>(() => {
    return localStorage.getItem('swasthya_low_bandwidth') === 'true';
  });
  const [educationPamphlets, setEducationPamphlets] = useState<any[]>([]);
  const [kiosks, setKiosks] = useState<any[]>([]);
  const [offlineBundle, setOfflineBundle] = useState<any | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadRuralData();
  }, [lang]);

  const loadRuralData = async () => {
    setIsLoading(true);
    try {
      const [eduRes, kioskRes, bundleRes] = await Promise.all([
        api.rural.getHealthEducation('all', lang),
        api.rural.getKiosks(),
        api.rural.getLowBandwidthBundle(),
      ]);

      if (eduRes.success) {
        setEducationPamphlets(eduRes.data || []);
      }
      if (kioskRes.success) {
        setKiosks(kioskRes.data || []);
      }
      if (bundleRes) {
        setOfflineBundle(bundleRes);
      }
    } catch (err) {
      console.error('Error loading rural access data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLowBandwidthMode = () => {
    const nextState = !isLowBandwidthMode;
    setIsLowBandwidthMode(nextState);
    localStorage.setItem('swasthya_low_bandwidth', String(nextState));
  };

  const handleSaveOfflineBundle = () => {
    if (!offlineBundle) return;
    localStorage.setItem('swasthya_offline_bundle', JSON.stringify(offlineBundle));
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 2G Low Bandwidth Status Ribbon */}
      <div className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isLowBandwidthMode 
          ? 'bg-amber-50 border-amber-300 text-amber-950' 
          : 'bg-teal-50 border-teal-200 text-teal-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isLowBandwidthMode ? 'bg-amber-200 text-amber-800' : 'bg-teal-200 text-teal-800'
          }`}>
            {isLowBandwidthMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span>{isLowBandwidthMode ? '2G Low-Bandwidth Mode Active' : 'Standard High-Speed Mode Active'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 border border-slate-300">
                {isLowBandwidthMode ? '16 kbps Compressed' : 'Adaptive 4G/WiFi'}
              </span>
            </h2>
            <p className="text-xs text-slate-600">
              {isLowBandwidthMode 
                ? 'Images compressed, heavy animations disabled, optimized for rural 2G/EDGE cellular connections.'
                : 'Experience full rich media, video teleconsultations, and animated telemetry charts.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLowBandwidthMode}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isLowBandwidthMode
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-teal-700 hover:bg-teal-800 text-white'
            }`}
          >
            {isLowBandwidthMode ? 'Switch to 4G/Full Mode' : 'Enable 2G Lite Mode'}
          </button>
        </div>
      </div>

      {/* Hero & Language Selection */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold px-3 py-1 rounded-full">
            <Radio className="w-3.5 h-3.5" />
            Gram Panchayat & Community Health Network
          </span>

          {/* Bilingual Switcher */}
          <div className="flex items-center bg-black/30 backdrop-blur-xs p-1 rounded-xl border border-white/20">
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                lang === 'hi' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                lang === 'en' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          {lang === 'hi'
            ? 'ग्रामीण स्वास्थ्य सेतु: 2G टेलीमेडिसिन एवं जन-जागरूकता'
            : 'Rural Healthcare Access: 2G Telemedicine & Community Care'}
        </h1>

        <p className="text-slate-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
          {lang === 'hi'
            ? 'दूरदराज के गांवों में बिना इंटरनेट या कमजोर 2G नेटवर्क में भी डॉक्टर से परामर्श, स्वास्थ्य परामर्श और निःशुल्क सरकारी दवाओं की जानकारी प्राप्त करें।'
            : 'Empowering remote villages with ultra-compact 2G teleconsultation kiosks, maternal and child survival guides, and verified public hospital directories.'}
        </p>

        {/* 1-Tap Emergency Hotlines */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="tel:108"
            className="bg-rose-600/90 hover:bg-rose-600 text-white p-3 rounded-2xl flex items-center justify-between shadow-md transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-5 h-5 text-rose-200 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-rose-200">National Ambulance</p>
                <p className="text-base font-extrabold tracking-wide">Dial 108 (Toll-Free)</p>
              </div>
            </div>
          </a>

          <a
            href="tel:14416"
            className="bg-teal-700/80 hover:bg-teal-700 text-white p-3 rounded-2xl flex items-center justify-between shadow-md transition-transform hover:-translate-y-0.5 border border-teal-500/30"
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-teal-300 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-teal-200">Tele-MANAS Mental Health</p>
                <p className="text-base font-extrabold tracking-wide">Dial 14416 (24/7)</p>
              </div>
            </div>
          </a>

          <a
            href="tel:18001808080"
            className="bg-indigo-700/80 hover:bg-indigo-700 text-white p-3 rounded-2xl flex items-center justify-between shadow-md transition-transform hover:-translate-y-0.5 border border-indigo-500/30"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-300 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-200">PMBJP Jan Aushadhi</p>
                <p className="text-base font-extrabold tracking-wide">1800-180-8080</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Offline Storage Card (<8KB Bundle) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'hi' ? 'ऑफलाइन स्वास्थ्य डायरेक्टरी बंडल (<8 KB)' : 'Ultra-Compact Offline Health Bundle (<8 KB)'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'hi'
                ? 'गांव में इंटरनेट बंद होने पर भी आपातकालीन फोन नंबर एवं नजदीकी स्वास्थ्य केंद्र फोन मेमोरी में सुरक्षित रखें।'
                : 'Save emergency contacts and nearest PHCs/Kiosks to local browser cache for zero-connectivity access.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveOfflineBundle}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs"
        >
          {downloadSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
          <span>{downloadSuccess ? (lang === 'hi' ? 'फोन में सुरक्षित हो गया!' : 'Cached Locally!') : (lang === 'hi' ? 'ऑफलाइन बंडल सहेजें' : 'Save Offline Bundle')}</span>
        </button>
      </div>

      {/* SECTION 1: Gram Panchayat Telemedicine Kiosks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-teal-600" />
              <span>{lang === 'hi' ? 'ग्राम पंचायत टेलीमेडिसिन कियोस्क नेटवर्क' : 'Gram Panchayat Telemedicine Kiosks'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'hi'
                ? '16 kbps 2G सेलुलर नेटवर्क एवं सोलर बैटरी बैकअप युक्त ई-संजीवनी केंद्र।'
                : 'Solar-powered IoT kiosks connected over 16 kbps 2G cellular data with digital stethoscope & BP monitor.'}
            </p>
          </div>

          <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            {kiosks.length} {lang === 'hi' ? 'सक्रिय कियोस्क' : 'Active Kiosks'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kiosks.map((kiosk) => (
            <div
              key={kiosk._id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                    2G Tele-Kiosk
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Ready
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{kiosk.name}</h3>
                <p className="text-xs text-slate-600 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>{kiosk.address}, {kiosk.district}</span>
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{kiosk.operatingHours || '08:00 AM - 04:00 PM'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${kiosk.contactNumber}`}
                  className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl flex-1 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Caretaker</span>
                </a>

                <button
                  onClick={() => onNavigate('telemedicine', { kioskId: kiosk._id, kioskName: kiosk.name })}
                  className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded-xl flex-1 shadow-xs transition-colors"
                >
                  <span>Queue Video</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Multilingual Health Education Guides (NHM / ICMR Verified) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>
              {lang === 'hi' 
                ? 'प्राथमिक स्वास्थ्य शिक्षा एवं जीवन-रक्षक दिशानिर्देश' 
                : 'Verified Rural Health Education & Clinical Checklists'}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'hi'
              ? 'राष्ट्रीय स्वास्थ्य मिशन (NHM), आईसीएमआर एवं डब्ल्यूएचओ द्वारा अनुमोदित दिशानिर्देश।'
              : 'Endorsed by National Health Mission (NHM), ICMR, and WHO-UNICEF protocols.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educationPamphlets.map((pamphlet) => {
            const title = lang === 'hi' ? pamphlet.title_hi : pamphlet.title_en;
            const summary = lang === 'hi' ? pamphlet.summary_hi : pamphlet.summary_en;
            const actions = lang === 'hi' ? pamphlet.actionSteps_hi : pamphlet.actionSteps_en;

            return (
              <div
                key={pamphlet.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-6 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {pamphlet.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      ID: {pamphlet.id}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    {title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {summary}
                  </p>

                  {/* Clinical Action Steps Checklist */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                      <span>{lang === 'hi' ? 'महत्वपूर्ण कदम (Checklist)' : 'Immediate Action Steps'}</span>
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {actions?.map((step: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                  <span>Authority: {pamphlet.verifiedAuthority}</span>
                  <button
                    onClick={() => onNavigate('telemedicine', { topic: pamphlet.category })}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    {lang === 'hi' ? 'डॉक्टर से पूछें →' : 'Consult Doctor →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
export default RuralAccessPage;
