'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { StudentAttendance } from '@/lib/db';
import { Download, Filter } from 'lucide-react';
import useSWR from 'swr';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    student_id: '',
    device_id: '',
    card_id: '',
    date: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.student_id) params.append('student_id', filters.student_id);
      if (filters.device_id) params.append('device_id', filters.device_id);
      if (filters.card_id) params.append('start_date', filters.card_id);
      if (filters.date) params.append('end_date', filters.date);
      params.append('page', page.toString());
      params.append('limit', '50');

      const res = await fetch(`/api/attendance?${params}`);
      const data = await res.json();
      setAttendance(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const { data, error, mutate, isLoading } = useSWR(
    () => {
      const params = new URLSearchParams();
      if (filters.student_id) params.append('student_id', filters.student_id);
      if (filters.device_id) params.append('device_id', filters.device_id);
      if (filters.card_id) params.append('card_id', filters.card_id);
      // if (filters.date) params.append('end_date', filters.date);
      params.append('page', page.toString());
      params.append('limit', '50');
      return `/api/attendance?${params}`;
    },
    async (url) => {
      const res = await fetch(url);
      const data = await res.json();
      console.log("Data", data)
      setTotalPages(data.pagination?.totalPages || 1);
      setAttendance(data.data || []);
      return data.data || [];
    }
  );

  useEffect(() => {
    // fetchAttendance();
    mutate();
  }, [filters, page]);

  // useEffect(() => {
  //   if (data) {
  //     setAttendance(data.data || []);
  //     // setTotalPages(data.pagination?.totalPages || 1);
  //   }
  // }, [data]);


  const handleExportCSV = () => {
    if (attendance.length === 0) {
      alert('No attendance records to export');
      return;
    }

    const headers = ['Student ID', 'Device ID', 'Student Name', 'Card ID', 'Timetsamp'];
    const rows = attendance.map((a) => [
      a.studentId,
      a.deviceId,
      a.studentName,
      a.cardId,
      new Date(a.timestamp).toLocaleString() || 'N/A'
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading && attendance.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Attendance History</h1>
          <p className="text-muted-foreground mt-2">View and track attendance records</p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-card border-border mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Student ID</label>
            <Input
              type="text"
              placeholder="Filter by student..."
              value={filters.student_id}
              onChange={(e) => {
                setFilters({ ...filters, student_id: e.target.value });
                setPage(1);
              }}
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Device ID</label>
            <Input
              type="text"
              placeholder="Filter by device..."
              value={filters.device_id}
              onChange={(e) => {
                setFilters({ ...filters, device_id: e.target.value.toUpperCase() });
                setPage(1);
              }}
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Card ID</label>
            <Input
              type="text"
              placeholder="Filter by Card ID..."
              value={filters.card_id}
              onChange={(e) => {
                setFilters({ ...filters, card_id: e.target.value.toUpperCase() });
                setPage(1);
              }}
              className="bg-background border-border"
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date</label>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => {
                setFilters({ ...filters, date: e.target.value });
                setPage(1);
              }}
              className="bg-background border-border"
            />
          </div> */}
        </div>
      </Card>

      {/* Attendance Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left font-semibold text-foreground">Student Name</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Student ID</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Device ID</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Card ID</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Timestamp</th>
              {/* <th className="px-6 py-3 text-left font-semibold text-foreground">Created At</th> */}
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 text-foreground font-medium">{record.studentName}</td>
                <td className="px-6 py-4 text-foreground font-medium">{record.studentId}</td>
                <td className="px-6 py-4 text-foreground">{record.deviceId}</td>
                <td className="px-6 py-4 text-foreground">{record.cardId}</td>
                <td className="px-6 py-4 text-foreground font-mono text-sm">
                  {new Date(record.timestamp).toLocaleString()}
                </td>
                {/* <td className="px-6 py-4 text-foreground font-mono text-sm">
                  {record.check_out_time
                    ? new Date(record.check_out_time).toLocaleTimeString()
                    : '—'}
                </td> */}
                {/* <td className="px-6 py-4 text-muted-foreground">
                  {record.duration_minutes
                    ? `${Math.floor(record.duration_minutes / 60)}h ${record.duration_minutes % 60}m`
                    : '—'}
                </td> */}
                {/* <td className="px-6 py-4 text-muted-foreground">{new Date(record.createdAt).toLocaleTimeString()}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attendance.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No attendance records found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="border-border"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="border-border"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
