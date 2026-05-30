"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, CheckCircle2, GraduationCap, XCircle } from "lucide-react";
import type { StudentAttendance } from "@/lib/db";

const ELIGIBILITY_THRESHOLD = 75;
const EXPECTED_SESSION_ATTENDANCES = 13;
const REQUIRED_ATTENDANCES = Math.ceil(
  (EXPECTED_SESSION_ATTENDANCES * ELIGIBILITY_THRESHOLD) / 100,
);

interface StudentCardRecord {
  cardId: string;
  courseCode: string;
  studentName: string;
  studentId: string;
  status: string;
}

interface StudentStats {
  studentId: string;
  studentName: string;
  courseCode: string;
  attendedSessions: number;
  totalSessions: number;
  percentage: number;
  eligible: boolean;
}

function getSessionKey(record: StudentAttendance) {
  const timestamp = new Date(record.timestamp);
  const dateKey = Number.isNaN(timestamp.getTime())
    ? String(record.timestamp)
    : timestamp.toISOString().slice(0, 10);

  return `${record.courseCode}:${dateKey}`;
}

export default function AnalyticsPage() {
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [studentCards, setStudentCards] = useState<StudentCardRecord[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndAnalyze();
  }, []);

  const fetchAndAnalyze = async () => {
    try {
      const [attendanceRes, cardsRes] = await Promise.all([
        fetch("/api/attendance?limit=1000"),
        fetch("/api/student-cards"),
      ]);

      const attendanceData = await attendanceRes.json();
      const cardsData = await cardsRes.json();

      setAttendance(attendanceData.data || []);
      setStudentCards(Array.isArray(cardsData) ? cardsData : []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const courses = useMemo(() => {
    const courseSet = new Set<string>();

    studentCards.forEach((card) => courseSet.add(card.courseCode));
    attendance.forEach((record) => courseSet.add(record.courseCode));

    return Array.from(courseSet).filter(Boolean).sort();
  }, [attendance, studentCards]);

  const studentStats = useMemo(() => {
    const studentSessions = new Map<string, Set<string>>();
    const studentMap = new Map<string, StudentStats>();

    attendance.forEach((record) => {
      const courseCode = record.courseCode;
      const sessionKey = getSessionKey(record);
      const studentKey = `${courseCode}:${record.studentId}`;

      if (!studentSessions.has(studentKey)) {
        studentSessions.set(studentKey, new Set());
      }
      studentSessions.get(studentKey)?.add(sessionKey);

      if (!studentMap.has(studentKey)) {
        studentMap.set(studentKey, {
          studentId: record.studentId,
          studentName: record.studentName,
          courseCode,
          attendedSessions: 0,
          totalSessions: 0,
          percentage: 0,
          eligible: false,
        });
      }
    });

    studentCards.forEach((card) => {
      const studentKey = `${card.courseCode}:${card.studentId}`;

      if (!studentMap.has(studentKey)) {
        studentMap.set(studentKey, {
          studentId: card.studentId,
          studentName: card.studentName,
          courseCode: card.courseCode,
          attendedSessions: 0,
          totalSessions: 0,
          percentage: 0,
          eligible: false,
        });
      }
    });

    return Array.from(studentMap.values())
      .map((student) => {
        const studentKey = `${student.courseCode}:${student.studentId}`;
        const attendedSessions = studentSessions.get(studentKey)?.size || 0;
        const percentage = Math.round(
          (attendedSessions / EXPECTED_SESSION_ATTENDANCES) * 100,
        );

        return {
          ...student,
          attendedSessions,
          totalSessions: EXPECTED_SESSION_ATTENDANCES,
          percentage,
          eligible: attendedSessions >= REQUIRED_ATTENDANCES,
        };
      })
      .filter((student) =>
        selectedCourse === "all" ? true : student.courseCode === selectedCourse,
      )
      .sort((a, b) => b.percentage - a.percentage || a.studentId.localeCompare(b.studentId));
  }, [attendance, selectedCourse, studentCards]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const eligibleStudents = studentStats.filter((student) => student.eligible);
  const ineligibleStudents = studentStats.filter((student) => !student.eligible);
  const averageAttendance =
    studentStats.length > 0
      ? Math.round(
          studentStats.reduce((sum, student) => sum + student.percentage, 0) /
            studentStats.length,
        )
      : 0;

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Attendance percentage and examination eligibility
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Course</label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full bg-background md:w-[220px]">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="bg-card p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Students</p>
          <p className="mt-2 text-4xl font-bold text-foreground">{studentStats.length}</p>
          <p className="mt-3 text-xs text-accent">Registered or recorded</p>
        </Card>

        <Card className="bg-card p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Average Attendance</p>
          <p className="mt-2 text-4xl font-bold text-foreground">{averageAttendance}%</p>
          <p className="mt-3 text-xs text-accent">Across selected students</p>
        </Card>

        <Card className="bg-card p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Eligible</p>
          <p className="mt-2 text-4xl font-bold text-foreground">{eligibleStudents.length}</p>
          <p className="mt-3 text-xs text-accent">
            {REQUIRED_ATTENDANCES} of {EXPECTED_SESSION_ATTENDANCES} marks
          </p>
        </Card>

        <Card className="bg-card p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Below Threshold</p>
          <p className="mt-2 text-4xl font-bold text-foreground">{ineligibleStudents.length}</p>
          <p className="mt-3 text-xs text-accent">Less than {REQUIRED_ATTENDANCES} marks</p>
        </Card>
      </div>

      <Card className="mb-8 bg-card p-6 border-border">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
          <BarChart3 className="h-5 w-5" />
          Attendance Percentage
        </h2>

        <div className="space-y-4">
          {studentStats.slice(0, 20).map((student) => (
            <div key={`${student.courseCode}:${student.studentId}`}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{student.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.studentId} • {student.courseCode} • {student.attendedSessions}/
                    {student.totalSessions} sessions
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">{student.percentage}%</p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div
                  className={
                    student.eligible
                      ? "h-full bg-primary"
                      : "h-full bg-destructive"
                  }
                  style={{ width: `${Math.min(student.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <EligibilityTable
          title="Examination Eligible"
          icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
          students={eligibleStudents}
          emptyMessage="No students have reached 75% yet"
        />
        <EligibilityTable
          title="Below 75%"
          icon={<XCircle className="h-5 w-5 text-destructive" />}
          students={ineligibleStudents}
          emptyMessage="No students below the threshold"
        />
      </div>

      {studentStats.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No attendance data available</p>
        </div>
      )}
    </div>
  );
}

function EligibilityTable({
  title,
  icon,
  students,
  emptyMessage,
}: {
  title: string;
  icon: ReactNode;
  students: StudentStats[];
  emptyMessage: string;
}) {
  return (
    <Card className="bg-card p-6 border-border">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
        {icon}
        {title}
      </h2>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-max w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 whitespace-nowrap">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Student</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Course</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Attendance</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={`${student.courseCode}:${student.studentId}`}
                className="border-b border-border transition-colors hover:bg-background/50"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-foreground">{student.studentName}</p>
                  <p className="text-xs text-muted-foreground">{student.studentId}</p>
                </td>
                <td className="px-4 py-4 font-mono text-foreground">{student.courseCode}</td>
                <td className="px-4 py-4 text-foreground">
                  {student.percentage}% ({student.attendedSessions}/{student.totalSessions})
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-2 rounded-md bg-background px-2 py-1 text-xs font-medium text-foreground">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {student.eligible ? "Eligible" : "Not eligible"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </Card>
  );
}
