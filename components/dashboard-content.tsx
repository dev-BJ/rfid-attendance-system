'use client';

import OverviewPage from './pages/overview-page';
import DevicesPage from './pages/devices-page';
import StudentCardsPage from './pages/student-cards-page';
import AttendancePage from './pages/attendance-page';
import AnalyticsPage from './pages/analytics-page';
import SettingsPage from './pages/settings-page';

interface DashboardContentProps {
  activeTab: string;
}

export default function DashboardContent({ activeTab }: DashboardContentProps) {
  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'devices':
        return <DevicesPage />;
      case 'cards':
        return <StudentCardsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <main className="flex-1 overflow-auto bg-background">
      {renderPage()}
    </main>
  );
}
