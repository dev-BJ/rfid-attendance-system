'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Wifi, CreditCard, Activity, TrendingUp } from 'lucide-react';
import type { SystemDevice, StudentCard, StudentAttendance } from '@/lib/db';

export default function OverviewPage() {
  const [devices, setDevices] = useState<SystemDevice[]>([]);
  const [cards, setCards] = useState<StudentCard[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesRes, cardsRes, attendanceRes] = await Promise.all([
          fetch('/api/devices'),
          fetch('/api/student-cards'),
          fetch('/api/attendance?limit=100'),
        ]);

        const devicesData = await devicesRes.json();
        const cardsData = await cardsRes.json();
        const attendanceData = await attendanceRes.json();

        setDevices(devicesData);
        setCards(cardsData);
        setAttendance(attendanceData.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="p-6 bg-card border-border hover:border-accent transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-foreground" />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to RFID Attendance System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Wifi}
          label="Active Devices"
          value={devices.length}
          color="bg-blue-500/10"
        />
        <StatCard
          icon={CreditCard}
          label="Student Cards"
          value={cards.length}
          color="bg-cyan-500/10"
        />
        <StatCard
          icon={Activity}
          label="Total Attendance"
          value={attendance.length}
          color="bg-purple-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Today's Check-ins"
          value={attendance.filter((a) => new Date(a.timestamp).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]).length}
          color="bg-green-500/10"
        />
      </div>

      {/* Recent Activity */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Attendance</h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {attendance.slice(0, 8).map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{record.studentId}</p>
                <p className="text-xs text-muted-foreground">{new Date(record.timestamp).toLocaleTimeString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-accent font-mono">
                  {new Date(record.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
