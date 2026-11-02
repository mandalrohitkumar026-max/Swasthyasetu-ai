import React from 'react';
import { PageId } from '../types/navigation';
import { DoctorPortalView } from '../components/DoctorPortalView';
import { useHealth } from '../context/HealthContext';
import { Sidebar } from '../components/shared/Sidebar';
import { DashboardCard } from '../components/shared/DashboardCard';
import { Users, Clock, HeartHandshake, ShieldCheck } from 'lucide-react';

interface DoctorDashboardPageProps {
  onNavigate: (page: PageId, data?: any) => void;
}

export const DoctorDashboardPage: React.FC<DoctorDashboardPageProps> = ({ onNavigate }) => {
  const { currentRole, setCurrentRole, currentUser, appointments, addPrescription } = useHealth();

  const handlePrescriptionCreated = (rx: any) => {
    addPrescription(rx);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Waiting OPD Queue"
          value={appointments.filter(a => a.status === 'waiting').length}
          subtitle="Patients in waiting room"
          change="3 Urgent"
          isPositive={false}
          icon={<Users className="w-4 h-4" />}
          iconBgColor="bg-amber-50 text-amber-700"
        />

        <DashboardCard
          title="Average Wait Time"
          value="4.2 mins"
          subtitle="Triage to consultation"
          change="Fast Track"
          isPositive={true}
          icon={<Clock className="w-4 h-4" />}
          iconBgColor="bg-teal-50 text-teal-700"
        />

        <DashboardCard
          title="Generic Savings Enabled"
          value="₹18,450"
          subtitle="This week's patient relief"
          change="82% Avg"
          isPositive={true}
          icon={<HeartHandshake className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-700"
        />

        <DashboardCard
          title="NMC Registry Status"
          value="Verified"
          subtitle="MCI/UP-2012/048821"
          icon={<ShieldCheck className="w-4 h-4" />}
          iconBgColor="bg-indigo-50 text-indigo-700"
        />
      </div>

      {/* Main Workspace Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar
          currentRole={currentRole}
          currentPage="doctor-dashboard"
          onNavigate={onNavigate}
          onRoleChange={setCurrentRole}
          userName={currentUser.name}
          userSubtitle="NMC Registered Teleconsultant"
        />

        <div className="flex-1 space-y-6">
          <DoctorPortalView
            currentUser={currentUser}
            onPrescriptionCreated={handlePrescriptionCreated}
          />
        </div>
      </div>

    </div>
  );
};
