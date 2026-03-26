'use client';

import { Icon } from 'lucide-react';
import { 
  LayoutDashboard, 
  Wifi, 
  CreditCard, 
  BarChart3, 
  Settings 
} from 'lucide-react';

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: Wifi },
    { id: 'cards', label: 'Student Cards', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: BarChart3 },
    // { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">RFID System</h1>
        <p className="text-sm text-sidebar-accent mt-1">Attendance Management</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-accent-foreground">
          <p className="font-semibold">System Status</p>
          <p className="text-sidebar-foreground mt-2">All devices active</p>
        </div>
      </div>
    </aside>
  );
}
