'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Attendance } from '@/lib/types';
import { BarChart3 } from 'lucide-react';

interface StudentStats {
  student_id: string;
  sessions: number;
  total_minutes: number;
  avg_minutes: number;
}

export default function AnalyticsPage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndAnalyze();
  }, []);

  const fetchAndAnalyze = async () => {
    try {
      const res = await fetch('/api/attendance?limit=1000');
      const data = await res.json();
      const records = data.data || [];
      setAttendance(records);

      // Calculate student stats
      const stats: Record<string, StudentStats> = {};

      records.forEach((record: Attendance) => {
        if (!stats[record.student_id]) {
          stats[record.student_id] = {
            student_id: record.student_id,
            sessions: 0,
            total_minutes: 0,
            avg_minutes: 0,
          };
        }
        stats[record.student_id].sessions += 1;
        stats[record.student_id].total_minutes += record.duration_minutes || 0;
      });

      // Calculate averages
      Object.values(stats).forEach((stat) => {
        stat.avg_minutes = Math.round(stat.total_minutes / stat.sessions);
      });

      const sorted = Object.values(stats)
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 20);

      setStudentStats(sorted);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const totalSessions = studentStats.reduce((sum, s) => sum + s.sessions, 0);
  const avgSessionsPerStudent =
    studentStats.length > 0
      ? Math.round(totalSessions / studentStats.length)
      : 0;
  const topStudent = studentStats[0];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">Attendance insights and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-card border-border">
          <p className="text-sm text-muted-foreground font-medium">Total Sessions</p>
          <p className="text-4xl font-bold text-foreground mt-2">{totalSessions}</p>
          <p className="text-xs text-accent mt-3">Across all students</p>
        </Card>

        <Card className="p-6 bg-card border-border">
          <p className="text-sm text-muted-foreground font-medium">Avg Sessions per Student</p>
          <p className="text-4xl font-bold text-foreground mt-2">{avgSessionsPerStudent}</p>
          <p className="text-xs text-accent mt-3">{studentStats.length} active students</p>
        </Card>

        <Card className="p-6 bg-card border-border">
          <p className="text-sm text-muted-foreground font-medium">Top Student</p>
          <p className="text-xl font-bold text-foreground mt-2">{topStudent?.student_id}</p>
          <p className="text-xs text-accent mt-3">{topStudent?.sessions} sessions</p>
        </Card>
      </div>

      {/* Student Rankings */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Top Students by Attendance
        </h2>

        <div className="space-y-4">
          {studentStats.map((stat, index) => (
            <div key={stat.student_id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{stat.student_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.sessions} sessions • Avg {stat.avg_minutes} min
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{stat.total_minutes} min</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{
                    width: `${(stat.sessions / (topStudent?.sessions || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {studentStats.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No attendance data available</p>
        </div>
      )}
    </div>
  );
}
