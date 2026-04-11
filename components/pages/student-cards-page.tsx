'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StudentCard } from '@/lib/db';
import { CreditCard, Plus, Trash2, Lock, Unlock } from 'lucide-react';

export default function StudentCardsPage() {
  const [cards, setCards] = useState<StudentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    device_id: "",
    card_id: "",
    course_code: "",
    student_name: "",
    student_id: "",
    phone_number: "",
    parent_phone_number: "",
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/student-cards');
      const data = await res.json();
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/student-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          device_id: "",
          card_id: "",
          course_code: "",
          student_name: "",
          student_id: "",
          phone_number: "",
          parent_phone_number: "",
        });
        setShowForm(false);
        fetchCards();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to register card');
      }
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleDelete = async (rfidCode: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      await fetch(`/api/student-cards?rfid_code=${rfidCode}`, {
        method: 'DELETE',
      });
      fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const toggleStatus = async (rfidCode: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await fetch('/api/student-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: rfidCode,
          status: newStatus,
        }),
      });
      fetchCards();
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading cards...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Student Cards</h1>
          <p className="text-muted-foreground mt-2">Register and manage RFID student cards</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Card
        </Button>
      </div>

      {/* Add Card Form */}
      {showForm && (
        <Card className="p-6 bg-card border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Register New Card</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Student ID</label>
                <Input
                  type="text"
                  placeholder="e.g., STU-2024-001"
                  value={formData.student_id}
                  onChange={(e) =>
                    setFormData({ ...formData, student_id: e.target.value.toUpperCase().trim() })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Student Name</label>
                <Input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={formData.student_name}
                  onChange={(e) =>
                    setFormData({ ...formData, student_name: e.target.value })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Card ID</label>
                <Input
                  type="text"
                  placeholder="e.g., CARD-001"
                  value={formData.card_id}
                  onChange={(e) =>
                    setFormData({ ...formData, card_id: e.target.value.toUpperCase().trim() })
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
                    setFormData({ ...formData, device_id: e.target.value.toUpperCase().trim() })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Course Code</label>
                <Input
                  type="text"
                  placeholder="e.g., COM"
                  value={formData.course_code}
                  onChange={(e) =>
                    setFormData({ ...formData, course_code: e.target.value.toUpperCase().trim() })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="e.g., +234..."
                  pattern="^(\+234|0)(?:[789][01]\d{8}|2\d{8,9})$"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value.trim() })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Parent Phone Number</label>
                <Input
                  type="tel"
                  pattern="^(\+234|0)(?:[789][01]\d{8}|2\d{8,9})$"
                  placeholder="e.g., +234..."
                  value={formData.parent_phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_phone_number: e.target.value.trim() })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Register Card
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

      {/* Cards Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold text-foreground">Student ID</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Card ID</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Course Code</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Student Name</th>
              <th className="px-6 py-3 text-right font-semibold text-foreground">Student ID</th>
              <th className="px-6 py-3 text-right font-semibold text-foreground">Phone Number</th>
              <th className="px-6 py-3 text-right font-semibold text-foreground">Parent Phone Number</th>
              <th className="px-6 py-3 text-right font-semibold text-foreground">Timestamp</th>
              <th className="px-6 py-3 text-right font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 text-foreground font-medium">{card.studentId}</td>
                <td className="px-6 py-4 text-foreground font-mono">{card.cardId}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      card.status === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : card.status === 'inactive'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {card.status}
                  </span>
                  {card.courseCode}
                </td>
                <td className="px-6 py-4 text-foreground font-mono">{card.studentName}</td>
                <td className="px-6 py-4 text-foreground font-mono">{card.studentId}</td>
                <td className="px-6 py-4 text-foreground font-mono">{card.phoneNumber}</td>
                <td className="px-6 py-4 text-foreground font-mono">{card.parentPhoneNumber}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {new Date(card.registeredAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border"
                    onClick={() => toggleStatus(card.cardId, card.status)}
                  >
                    {card.status === 'active' ? (
                      <>
                        <Lock className="w-4 h-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(card.cardId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cards.length === 0 && !loading && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No cards registered yet</p>
        </div>
      )}
    </div>
  );
}
