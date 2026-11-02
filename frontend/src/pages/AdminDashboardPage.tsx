import React from 'react';
import { PageId } from '../types/navigation';
import { AdminPortalView } from '../components/AdminPortalView';
import { useHealth } from '../context/HealthContext';
import { Sidebar } from '../components/shared/Sidebar';

interface AdminDashboardPageProps {
  onNavigate: (page: PageId, data?: any) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { currentRole, setCurrentRole, currentUser } = useHealth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Main Workspace Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar
          currentRole={currentRole}
          currentPage="admin-dashboard"
          onNavigate={onNavigate}
          onRoleChange={setCurrentRole}
          userName={currentUser.name}
          userSubtitle={currentUser.facilityName || "NHA Digital Governance"}
        />

        <div className="flex-1 space-y-6">
          <AdminPortalView
            currentRole={currentRole}
          />
        </div>
      </div>
    </div>
  );
};
export default AdminDashboardPage;
