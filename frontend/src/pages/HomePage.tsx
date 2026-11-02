import React from 'react';
import { PageId } from '../types/navigation';
import { Stethoscope, Star, User, ArrowUpRight } from 'lucide-react';
import doctorImg from '../assets/doctor_transparent.png';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#B9D7E8] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-10 font-sans antialiased selection:bg-teal-200 selection:text-teal-900">
      
      {/* 1. MAIN CONTAINER: Large rounded rectangular website container with thin white border */}
      <div className="max-w-[1240px] w-full rounded-[32px] sm:rounded-[40px] lg:rounded-[44px] border-[1.5px] border-white/70 shadow-[0_30px_70px_-15px_rgba(8,58,80,0.25)] overflow-hidden bg-white flex flex-col transition-all">
        
        {/* 2. HERO SECTION: Full-width teal-to-blue gradient background */}
        <section className="relative bg-gradient-to-r from-[#096a8a] via-[#0f8da7] to-[#1cb5b1] px-6 sm:px-10 lg:px-14 pt-7 pb-24 sm:pb-32 lg:pb-36 overflow-hidden">
          
          {/* Subtle Radial Glow in Hero Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_42%,rgba(45,205,200,0.32),transparent_55%)] pointer-events-none" />

          {/* NAVIGATION BAR (Inside the teal hero container) */}
          <nav className="relative z-20 flex items-center justify-between">
            
            {/* Logo on the Left: SwasthyaSetu AI with Starburst Emblem */}
            <div 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-7 h-7 flex items-center justify-center text-white transition-transform group-hover:rotate-45 duration-300">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path d="M12 2C12.5523 2 13 2.44772 13 3V7.05436C14.0722 7.28448 15.0689 7.76997 15.8995 8.46447L18.7678 5.59619C19.1583 5.20567 19.7915 5.20567 20.182 5.59619C20.5725 5.98672 20.5725 6.61988 20.182 7.01041L17.3137 9.87868C18.0082 10.7092 18.4937 11.7059 18.7238 12.7781H21C21.5523 12.7781 22 13.2259 22 13.7781C22 14.3304 21.5523 14.7781 21 14.7781H18.7238C18.4937 15.8503 18.0082 16.847 17.3137 17.6775L20.182 20.5458C20.5725 20.9363 20.5725 21.5695 20.182 21.96C19.7915 22.3505 19.1583 22.3505 18.7678 21.96L15.8995 19.0917C15.0689 19.7862 14.0722 20.2717 13 20.5018V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V20.5018C9.92778 20.2717 8.93107 19.7862 8.10051 19.0917L5.23223 21.96C4.84171 22.3505 4.20854 22.3505 3.81802 21.96C3.42749 21.5695 3.42749 20.9363 3.81802 20.5458L6.68629 17.6775C5.99179 16.847 5.50631 15.8503 5.27618 14.7781H3C2.44772 14.7781 2 14.3304 2 13.7781C2 13.2259 2.44772 12.7781 3 12.7781H5.27618C5.50631 11.7059 5.99179 10.7092 6.68629 9.87868L3.81802 7.01041C3.42749 6.61988 3.42749 5.98672 3.81802 5.59619C4.20854 5.20567 4.84171 5.20567 5.23223 5.59619L8.10051 8.46447C8.93107 7.76997 9.92778 7.28448 11 7.05436V3C11 2.44772 11.4477 2 12 2Z" />
                </svg>
              </div>
              <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
                SwasthyaSetu AI
              </span>
            </div>

            {/* Navigation Links in Center */}
            <div className="hidden md:flex items-center gap-7 lg:gap-9 text-white/90 text-sm font-medium">
              <button 
                onClick={() => onNavigate('home')} 
                className="text-white font-bold transition-colors cursor-pointer"
              >
                Home
              </button>
              <button 
                onClick={() => onNavigate('about')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                About us
              </button>
              <button 
                onClick={() => onNavigate('services')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Services
              </button>
              <button 
                onClick={() => onNavigate('affordable-centers')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Why Us
              </button>
              <button 
                onClick={() => onNavigate('telemedicine')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Pricing
              </button>
            </div>

            {/* Sign In Button on the Right */}
            <div>
              <button
                onClick={() => onNavigate('auth')}
                className="bg-white hover:bg-slate-50 text-[#0c3950] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-all hover:scale-105 cursor-pointer"
              >
                <User className="w-4 h-4 text-[#0c3950]" />
                <span>Sign In</span>
              </button>
            </div>

          </nav>

          {/* HERO CONTENT & DOCTOR PHOTOGRAPH */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-4 items-center pt-10 sm:pt-14 lg:pt-16">
            
            {/* LEFT SIDE: Hero Content */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
              
              {/* Trust Indicator Pill Badge */}
              <div className="inline-flex items-center gap-3">
                {/* 4 Overlapping User Avatars */}
                <div className="flex -space-x-2 shrink-0">
                  <img 
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white/60 object-cover shadow-xs" 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" 
                    alt="User 1" 
                  />
                  <img 
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white/60 object-cover shadow-xs" 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" 
                    alt="User 2" 
                  />
                  <img 
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white/60 object-cover shadow-xs" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" 
                    alt="User 3" 
                  />
                  <img 
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white/60 object-cover shadow-xs" 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80" 
                    alt="User 4" 
                  />
                </div>
                {/* Text Pill */}
                <span className="bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs">
                  Affordable Healthcare for Everyone
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] xl:text-[56px] font-black text-white tracking-tight leading-[1.12]">
                Your Trusted Partner for Affordable &amp; Accessible Healthcare
              </h1>

              {/* Supporting Text */}
              <p className="text-white/85 text-sm sm:text-base lg:text-[17px] leading-relaxed max-w-lg font-normal">
                Connecting patients, doctors and intelligent healthcare services through one accessible digital platform.
              </p>

              {/* Action Buttons: Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                {/* Primary CTA: Pill button with dark circular arrow badge */}
                <button
                  onClick={() => onNavigate('ai-assistant')}
                  className="bg-white hover:bg-slate-50 text-[#0c3950] font-extrabold text-sm pl-6 pr-2.5 py-2.5 rounded-full inline-flex items-center gap-3.5 shadow-xl hover:shadow-2xl transition-all cursor-pointer group hover:scale-[1.02]"
                >
                  <span>Get Started Today</span>
                  <span className="w-8 h-8 rounded-full bg-[#0c3950] text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-xs">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </button>

                {/* Secondary CTA: Translucent glass pill button */}
                <button
                  onClick={() => onNavigate('about')}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm font-semibold text-sm px-6 py-3.5 rounded-full transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <span>Learn More</span>
                </button>
              </div>

            </div>

            {/* RIGHT SIDE: Large Professional Doctor Photograph with Floating Cards & Yellow Arrow */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-end pt-8 lg:pt-0 min-h-[460px] sm:min-h-[520px] lg:min-h-[580px]">
              
              {/* Playful Hand-Drawn Yellow Curved Arrow (Pointing to Doctor) */}
              <div className="absolute right-10 sm:right-20 lg:right-24 top-2 sm:top-6 z-20 pointer-events-none animate-bounce-subtle">
                <svg 
                  className="w-20 h-16 sm:w-24 sm:h-20 text-[#FEE047] filter drop-shadow-md" 
                  viewBox="0 0 100 80" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M 15 22 C 45 4, 82 12, 78 46 C 76 56, 70 65, 65 70" />
                  <polyline points="52 66, 65 70, 75 58" />
                </svg>
              </div>

              {/* Realistic Doctor Photograph */}
              <div className="relative z-10 w-full max-w-[380px] sm:max-w-[440px] lg:max-w-[490px] flex justify-center">
                <img
                  src={doctorImg}
                  alt="Professional Medical Doctor with Stethoscope"
                  className="w-full h-auto object-contain filter drop-shadow-[0_20px_45px_rgba(3,40,58,0.35)]"
                />
              </div>

              {/* Floating Card 1: 24/7 Health Support (Right near doctor shoulder) */}
              <div className="absolute -right-2 sm:right-2 lg:-right-4 top-1/3 z-20 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3.5 shadow-2xl text-white max-w-[230px] sm:max-w-[250px] transition-transform hover:scale-105 duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                    <Stethoscope className="w-5 h-5 text-sky-200" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">24/7 Health Support</div>
                    <div className="text-[11px] text-white/80 leading-snug mt-0.5">
                      Access digital healthcare assistance whenever you need it.
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card 2: 4.9 Average Rating (Bottom left near doctor waist) */}
              <div className="absolute left-0 sm:left-4 bottom-8 sm:bottom-12 z-20 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3.5 sm:p-4 shadow-2xl text-white min-w-[170px] sm:min-w-[190px] transition-transform hover:scale-105 duration-300">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-black text-white">4.9</span>
                </div>
                <div className="text-[11px] text-white/85 leading-snug mt-1.5 font-medium">
                  Average rating from our verified patients.
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* 3. BOTTOM STATISTICS SECTION: Light-blue section overlapping the bottom of the hero */}
        <section className="bg-[#EAF3F7] rounded-t-[36px] -mt-16 sm:-mt-20 lg:-mt-24 relative z-30 px-6 sm:px-10 lg:px-14 py-10 sm:py-12 border-t border-white/50 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            
            {/* Left Side Heading */}
            <div className="lg:col-span-5 text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-[#0c3950] leading-[1.2] max-w-sm tracking-tight">
                Empowering lives through affordable digital health solutions.
              </h2>
            </div>

            {/* Right Side: Three Large Statistics */}
            <div className="lg:col-span-7 flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-8 sm:gap-12 lg:gap-16">
              
              {/* Stat 1: Verified Doctors */}
              <div className="text-left">
                <div className="text-3xl sm:text-4xl lg:text-[54px] font-black text-[#0c3950] tracking-tight leading-none">
                  3K+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-2">
                  Verified Doctors
                </div>
              </div>

              {/* Stat 2: Partner Healthcare Centers */}
              <div className="text-left">
                <div className="text-3xl sm:text-4xl lg:text-[54px] font-black text-[#0c3950] tracking-tight leading-none">
                  400+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-2">
                  Partner Clinics
                </div>
              </div>

              {/* Stat 3: Medical Specialties */}
              <div className="text-left">
                <div className="text-3xl sm:text-4xl lg:text-[54px] font-black text-[#0c3950] tracking-tight leading-none">
                  50+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-2">
                  Medical Specialties
                </div>
              </div>

            </div>

          </div>
        </section>

      </div>

    </div>
  );
};
