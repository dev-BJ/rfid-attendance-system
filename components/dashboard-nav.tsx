"use client";

import { useEffect } from "react";
import {
  LayoutDashboard,
  Wifi,
  CreditCard,
  BarChart3,
  Settings,
  Users,
  LogOut
} from "lucide-react";
import { useUserContext } from "@/lib/context/users";

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showNav: boolean;
  onShowNav: (show: boolean) => void;
}

export default function DashboardNav({
  activeTab,
  onTabChange,
  showNav,
  onShowNav
}: DashboardNavProps) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "lecturers", label: "Lecturers", icon: Users },
    { id: "devices", label: "Devices", icon: Wifi },
    { id: "cards", label: "Student Cards", icon: CreditCard },
    { id: "attendance", label: "Attendance", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];
  const { user } = useUserContext();

  // useEffect(() => {
  //   for (const item of navItems) {
  //     if (item.id === activeTab) {
  //       continue;
  //     }
  //     onTabChange('overview');
  //     break;
  //   }
  // }, [activeTab])

  return (
    <aside
      className={`bg-sidebar border-r border-sidebar-border w-64 h-full md:flex flex-col ${showNav ? "flex fixed inset-0 z-50" : "hidden md:flex"}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border flex">
        <div className="gap-2.5 flex flex-col items-start justify-normal w-11/12">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            RFID System
          </h1>
          <p className="text-sm text-sidebar-accent mt-1">
            Attendance Management
          </p>
        </div>
        <div className="flex items-center md:hidden">
          <button
            type="button"
            className="text-sidebar-foreground text-xl font-bold"
            onClick={() => onShowNav(false)}
            aria-label="Close navigation"
          >
            X
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          if (user && user.role !== 'admin' && item.id === 'lecturers') return;
          if (user && user.role === 'admin' && item.id === 'settings') return;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
          <p className="text-sidebar-foreground font-semibold">System Status</p>
          <p className="text-sidebar-foreground mt-2">All devices active</p>
        </div>
      </div>
    </aside>
  );
}
