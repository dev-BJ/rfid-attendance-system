"use client";

import { useEffect, useState, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users } from "@/lib/db";
import {
  CreditCard,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Users as LTUsers,
  PenSquare,
} from "lucide-react";
import { useUserContext } from "@/lib/context/users";
import { useRouter } from "next/navigation";

// export default function LecturersPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-slate-400">Loading...</p>
//         </div>
//       }
//     >
//       <LecturersMain />
//     </Suspense>
//   );
// }

export default function LecturersPage() {
  const router = useRouter();
  const [lecturers, setLecturers] = useState<
    Omit<Users, "password" | "updatedAt">[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"r" | "e">("r"); // r - Registration Mode, e - Edit Mode
  const [updateUserId, setUpdateUserId] = useState("");
  const [formData, setFormData] = useState({
    user_id: "",
    full_name: "",
    courses: "",
  });
  const { user } = useUserContext();

  // useEffect(() => {
  //   if (user && user.role === "admin") router.replace("?page=overview");
  // }, [router]);

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      const res = await fetch("/api/lecturers");
      const data = await res.json();
      setLecturers(data);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `/api/lecturers${formMode === "e" ? "?user_id=" + updateUserId : ''}`,
        {
          method: formMode === "r" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (res.ok) {
        setFormData({
          user_id: "",
          full_name: "",
          courses: "",
        });
        setShowForm(false);
        setFormMode("r");
        setUpdateUserId("");
        fetchLecturers();
      } else {
        const error = await res.json();
        console.log("Form Mode: ", formMode);
        alert(
          error.message || formMode === "r"
            ? "Failed to register lecturer"
            : "Failed to update lecturer",
        );
      }
    } catch (error) {
      console.error(
        formMode === "r"
          ? "Error creating lecturer:"
          : "Error updating lecturer:",
        error,
      );
    }
  };

  const handleDelete = async (user_id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      await fetch(`/api/lecturers?user_id=${user_id}`, {
        method: "DELETE",
      });
      fetchLecturers();
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading lecturers...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Lecturers</h1>
          <p className="text-muted-foreground mt-2">
            Register and manage lecturers
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Lecturer
        </Button>
      </div>

      {/* Add Card Form */}
      {showForm && (
        <Card className="p-6 bg-card border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Register New Lecturer
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Lecturer ID
                </label>
                <Input
                  type="text"
                  placeholder="e.g., lecturer_1"
                  value={formData.user_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      user_id: e.target.value.trim(),
                    })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Lecturer Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Courses
                </label>
                <Input
                  type="text"
                  placeholder="e.g., COM, GNS or COM GNS"
                  value={formData.courses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courses: e.target.value.toUpperCase().trim(),
                    })
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {formMode === "r" ? "Register Lecturer" : "Update Lecturer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  if (formMode !== "r") {
                    setFormData({
                      user_id: "",
                      full_name: "",
                      courses: "",
                    });
                    setFormMode("r");
                    setUpdateUserId("");
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Cards Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-max w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Lecturer ID
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Lecturer Name
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Lecturer Courses
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Registration Time/Date
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Action(s)
              </th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lecturer, index) => (
              <tr
                key={index}
                className="border-b border-border hover:bg-background/50 transition-colors"
              >
                <td className="px-6 py-4 text-foreground font-medium">
                  {lecturer.user_id}
                </td>
                <td className="px-6 py-4 text-foreground font-mono">
                  {lecturer.full_name}
                </td>
                <td className="px-6 py-4 text-foreground font-mono">
                  {Array.isArray(lecturer.courses as any)
                    ? (lecturer.courses as any).join(",")
                    : lecturer.courses}
                </td>
                <td className="px-6 py-4 text-foreground font-mono">
                  {new Date(lecturer.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border"
                    disabled={formMode === "e"}
                    onClick={() => {
                      setFormData({
                        user_id: lecturer.user_id,
                        full_name: lecturer.full_name,
                        courses: String(lecturer.courses),
                      });
                      setUpdateUserId(lecturer.user_id);
                      setFormMode("e");
                      setShowForm(true);
                    }}
                  >
                    <PenSquare className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(lecturer.user_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lecturers.length === 0 && !loading && (
        <div className="text-center py-12">
          <LTUsers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No lecturers registered yet</p>
        </div>
      )}
    </div>
  );
}
