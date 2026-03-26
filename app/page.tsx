'use client';

import { useState } from 'react';
import DashboardNav from '@/components/dashboard-nav';
import DashboardContent from '@/components/dashboard-content';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardContent activeTab={activeTab} />
      </div>
    </div>
  );
}
