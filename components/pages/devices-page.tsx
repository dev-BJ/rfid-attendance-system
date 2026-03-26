'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { SystemDevice } from '@/lib/types';
import type { SystemDevice } from '@/lib/db';
import { Wifi, Plus, Trash2, Edit2 } from 'lucide-react';

export default function DevicesPage() {
  const [devices, setDevices] = useState<SystemDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    faculty: '',
    device_id: '',
    departments: '',
    levels: '',
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ faculty: '', device_id: '', departments: '', levels: '' });
        setShowForm(false);
        fetchDevices();
      }
    } catch (error) {
      console.error('Error creating device:', error);
    }
  };

  const handleDelete = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      await fetch(`/api/devices?device_id=${deviceId}`, {
        method: 'DELETE',
      });
      fetchDevices();
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading devices...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Devices</h1>
          <p className="text-muted-foreground mt-2">Manage RFID scanning devices</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Add Device Form */}
      {showForm && (
        <Card className="p-6 bg-card border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Register New Device</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Faculty</label>
                <Input
                  type="text"
                  placeholder="e.g., SCSS"
                  value={formData.faculty}
                  onChange={(e) =>
                    setFormData({ ...formData, faculty: e.target.value })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Device ID</label>
                <Input
                  type="text"
                  placeholder="e.g., device-001"
                  value={formData.device_id}
                  onChange={(e) =>
                    setFormData({ ...formData, device_id: e.target.value })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Departments</label>
                <Input
                  type="text"
                  placeholder="e.g., COM"
                  value={formData.departments}
                  onChange={(e) =>
                    setFormData({ ...formData, departments: e.target.value })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Levels</label>
                <Input
                  type="text"
                  placeholder="e.g., 100v, 200v"
                  value={formData.levels}
                  onChange={(e) =>
                    setFormData({ ...formData, levels: e.target.value })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Register Device
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Devices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <Card
            key={device.id}
            className="p-6 bg-card border-border hover:border-accent transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wifi className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{device.deviceId}</h3>
                  {/* <h3 className="font-semibold text-foreground">{device.device_name}</h3> */}
                  {/* <p className="text-xs text-muted-foreground">{device.device_id}</p> */}
                </div>
              </div>
              {/* <div
                className={`px-2 py-1 rounded text-xs font-medium ${
                  device.status === 'active'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {device.status}
              </div> */}
              <div>{device.faculty}</div>
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              <p><span className="font-medium">Departments:</span> {device.departments}</p>
              <p><span className="font-medium">Levels:</span> {device.levels}</p>
            </div>

            {/* <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-border"
                disabled
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-border text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(device.deviceId)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div> */}
          </Card>
        ))}
      </div>

      {devices.length === 0 && !loading && (
        <div className="text-center py-12">
          <Wifi className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No devices registered yet</p>
        </div>
      )}
    </div>
  );
}
