import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageId } from './types/navigation';
import { HealthProvider, useHealth } from './context/HealthContext';

// 15 Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { FindDoctorsPage } from './pages/FindDoctorsPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { TelemedicinePage } from './pages/TelemedicinePage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { HealthRecordsPage } from './pages/HealthRecordsPage';
import { HealthMonitoringPage } from './pages/HealthMonitoringPage';
import { AffordableCentersPage } from './pages/AffordableCentersPage';
import { ResourceDirectoryPage } from './pages/ResourceDirectoryPage';
import { RuralAccessPage } from './pages/RuralAccessPage';
import { AuthPage } from './pages/AuthPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ContactPage } from './pages/ContactPage';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedLanguage, setSelectedLanguage, setCurrentRole } = useHealth();

  // Convert pathname to PageId
  const getPageIdFromPath = (path: string): PageId => {
    const clean = path.replace(/^\//, '');
    if (!clean) return 'home';
    return clean as PageId;
  };

  const currentPage = getPageIdFromPath(location.pathname);

  const handleNavigate = (page: PageId, data?: any) => {
    const targetPath = page === 'home' ? '/' : `/${page}`;
    navigate(targetPath, { state: data });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleSelect = (role: any) => {
    setCurrentRole(role);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Top Header (Shown on inner application pages; framed home page has its integrated navbar) */}
      {currentPage !== 'home' && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      )}

      {/* Main Routed Page Body */}
      <main className="flex-1 bg-white">
        <Routes>
          <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/about" element={<AboutPage onNavigate={handleNavigate} />} />
          <Route path="/services" element={<ServicesPage onNavigate={handleNavigate} />} />
          <Route path="/ai-assistant" element={<AiAssistantPage onNavigate={handleNavigate} selectedLanguage={selectedLanguage} />} />
          <Route path="/find-doctors" element={<FindDoctorsPage onNavigate={handleNavigate} />} />
          <Route path="/book-appointment" element={<BookAppointmentPage onNavigate={handleNavigate} bookingData={location.state} />} />
          <Route path="/telemedicine" element={<TelemedicinePage onNavigate={handleNavigate} />} />
          <Route path="/patient-dashboard" element={<PatientDashboardPage onNavigate={handleNavigate} />} />
          <Route path="/health-records" element={<HealthRecordsPage onNavigate={handleNavigate} />} />
          <Route path="/health-monitoring" element={<HealthMonitoringPage onNavigate={handleNavigate} />} />
          <Route path="/affordable-centers" element={<AffordableCentersPage onNavigate={handleNavigate} />} />
          <Route path="/resources" element={<ResourceDirectoryPage onNavigate={handleNavigate} />} />
          <Route path="/rural-access" element={<RuralAccessPage onNavigate={handleNavigate} />} />
          <Route path="/auth" element={<AuthPage onNavigate={handleNavigate} onRoleSelect={handleRoleSelect} />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboardPage onNavigate={handleNavigate} />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage onNavigate={handleNavigate} />} />
          <Route path="/contact" element={<ContactPage onNavigate={handleNavigate} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer (Shown on inner application pages) */}
      {currentPage !== 'home' && (
        <Footer onNavigate={handleNavigate} />
      )}

    </div>
  );

}

export function App() {
  return (
    <BrowserRouter>
      <HealthProvider>
        <AppLayout />
      </HealthProvider>
    </BrowserRouter>
  );
}

export default App;
